# Cafe Scribble — Design Document

This document describes the system as implemented in the repository. It is written to match the current codepaths and file structure, not an aspirational architecture.

## Goals & Non‑Goals

### Goals

- **Write markdown comfortably** in a rich editor, while preserving a markdown source-of-truth.
- **Store notes in the user’s GitHub repo** as versioned `.md` files.
- **Require no long-running backend**: deploy as a static SPA + a minimal serverless OAuth proxy.
- **Keep the UX simple**: explicit commits via a button or `Cmd/Ctrl+S`, clear “committed/uncommitted” feedback, and safe navigation warnings.

### Non‑Goals (current code)

- **Real-time collaboration**.
- **Multi-directory note trees**: notes are in the **repo root**.
- **Full CommonMark / GFM fidelity**: markdown conversion is regex-based and intentionally minimal.
- **Secret storage server-side**: the GitHub OAuth client secret is not used (Device Flow).

## High-Level Architecture

Cafe Scribble is:

- A **React + TypeScript SPA** built with **Vite**.
- A minimal **Edge Runtime** serverless function that proxies **GitHub OAuth Device Flow** endpoints due to CORS restrictions.

At runtime, the system components are:

- **Browser app** (React): renders UI, stores auth state, edits content, calls GitHub REST API.
- **OAuth proxy** (`api/github-oauth.ts`): forwards 2 OAuth endpoints to GitHub and enforces a strict Origin allowlist.
- **GitHub REST API**: stores repositories and files (contents API).

## Routing & Page Flow

Routing is handled by React Router in `src/App.tsx`:

- `/`
  - If unauthenticated: shows `LandingPage` (`src/pages/Landing.tsx`)
  - If authenticated and a repo is selected: redirects to `/dashboard`
  - If authenticated but no repo selected: redirects to `/repos`
- `/repos` (protected): `RepoPickerPage` (`src/pages/RepoPicker.tsx`)
- `/dashboard` (protected + requires selected repo): `DashboardPage` (`src/pages/Dashboard.tsx`)
- `/editor/:path` (protected + requires selected repo): `EditorPage` (`src/pages/EditorPage.tsx`)

Two guards implement this:

- `ProtectedRoute`: requires `isAuthenticated`
- `RequireRepo`: requires `selectedRepo`

## Configuration & Environment

### Vite base path

`vite.config.ts` chooses the app base path depending on build target:

- **Vercel** (domain root): `base: '/'`
- **GitHub Pages** (repo path): `base: '/cafe-scribble/'` when `--mode github-pages` or `GITHUB_PAGES=true`

### Auth configuration

`src/services/auth.ts` reads:

- `VITE_GITHUB_CLIENT_ID` (**required**) — GitHub OAuth App client id.
- `VITE_OAUTH_PROXY_URL` (**optional**) — URL to the OAuth proxy.
  - Defaults to `/api/github-oauth` (works on Vercel, where `api/` is deployed).
  - In local Vite dev, you typically set this to a deployed proxy or run `npx vercel dev`.

## Authentication (GitHub OAuth Device Flow)

Authentication is implemented in `src/services/auth.ts` and driven by `src/pages/Landing.tsx`.

### Storage model

Auth state is persisted in `localStorage`:

- `github_access_token`: OAuth access token
- `github_user`: serialized GitHub user object from `GET https://api.github.com/user`
- `selected_repo`: the chosen repo full name (`owner/repo`)

`src/hooks/useAuth.tsx` exposes an `AuthProvider` context:

- Reads initial state from `AuthService`
- Syncs across tabs via the `storage` event
- Provides `logout()`, `setSelectedRepo()`, and `refreshAuth()`

### Device Flow sequence (implemented)

1. User clicks “Continue with GitHub” in `LandingPage`.
2. `AuthService.startDeviceFlow()` calls the proxy (`VITE_OAUTH_PROXY_URL`) with:
   - `endpoint: https://github.com/login/device/code`
   - `client_id`
   - `scope: 'repo user'`
3. UI shows the returned `user_code` and `verification_uri`.
4. Client polls for the token via the proxy with:
   - `endpoint: https://github.com/login/oauth/access_token`
   - `client_id`, `device_code`, `grant_type`
5. On success:
   - Stores `github_access_token`
   - Fetches `https://api.github.com/user` and stores `github_user`
   - Signals success to the UI (`refreshAuth()` and navigates to `/repos`)

### OAuth proxy behavior

`api/github-oauth.ts`:

- Runs on the Edge Runtime (`export const config = { runtime: 'edge' }`)
- Accepts **POST** requests with JSON body `{ endpoint, ...rest }`
- Allows only two endpoints via `ALLOWED_ENDPOINTS`
- Adds CORS headers based on a strict allowlist in `getCorsHeaders()`

This proxy exists because GitHub’s OAuth Device Flow endpoints are not CORS-enabled for browser clients.

## Repository Selection

`RepoPickerPage` (`src/pages/RepoPicker.tsx`):

- Loads repos via `GitHubService.getRepositories()` → `GET /user/repos?sort=updated&per_page=100`
- Lets the user:
  - Select an existing repo (stores `selected_repo` and routes to `/dashboard`)
  - Create a new repo via `GitHubService.createRepository()` (`POST /user/repos`)
    - Uses `auto_init: true` (GitHub creates a README commit)

## Document Model

Notes (“scribbles”) are modeled as:

```ts
export interface ScribbleDocument {
  name: string;   // derived from filename (no .md)
  path: string;   // filename in repo root
  sha: string;    // Git blob SHA required for updates/deletes
  content: string;
}
```

Implementation source: `src/services/github.ts`.

### Storage conventions

- Scribbles are **repo-root** markdown files (`*.md`) excluding `README.md`.
- Filenames are derived from user-facing names by replacing characters not in `[a-zA-Z0-9-_]` with `-` and appending `.md`.

## GitHub API Access

All GitHub REST calls go through `githubFetch()` in `src/services/github.ts`:

- Reads the access token from `AuthService.getAccessToken()`
- Calls `https://api.github.com` with:
  - `Authorization: Bearer <token>`
  - `Accept: application/vnd.github.v3+json`
- Throws an `Error` on non-OK responses using the GitHub `message` field when available

### Contents operations

Key operations in `GitHubService`:

- `getContents(owner, repo, path='')`
  - Calls `GET /repos/:owner/:repo/contents/:path`
  - Returns an array; returns `[]` on 404
- `getFileContent(owner, repo, path)`
  - Decodes base64 content via `atob` + `TextDecoder('utf-8')`
  - Falls back to `download_url` when needed
- `saveFile(owner, repo, path, content, message, sha?)`
  - Encodes UTF-8 to base64 using `TextEncoder` + `btoa`
  - Calls `PUT /repos/:owner/:repo/contents/:path`
- `deleteFile(owner, repo, path, sha, message?)`
  - Calls `DELETE /repos/:owner/:repo/contents/:path`

### Eventual consistency handling

GitHub’s “contents” listing can be eventually consistent immediately after mutations. `GitHubService` includes a retry loop:

- `waitForCondition(checkFn, maxAttempts=10, interval=1500ms)`
- Used by:
  - `deleteFile()` (wait until file no longer exists)
  - `createScribble()` (wait until file appears)
  - `renameScribble()` (wait for new file, then delete old, then verify both conditions)

This is why the UI hints that new repos/scribbles “may take a minute to appear”.

## Dashboard

`DashboardPage` (`src/pages/Dashboard.tsx`) implements:

- Loading documents:
  - Derives `{ owner, repo }` from `selectedRepo`
  - Calls `GitHubService.getScribbleDocuments(owner, repo)`
  - Displays a grid of documents with a preview snippet from `doc.content`
- Creating a new scribble:
  - **Does not create the file immediately**
  - Generates the path and default content locally
  - Navigates to `/editor/:path` with `location.state = { isNew: true, name, content }`
- Deleting:
  - Calls `GitHubService.deleteFile(...)`, then removes from local UI state
- Renaming:
  - Calls `GitHubService.renameScribble(...)`, then updates UI state

## Editor

The editor is split into:

- `EditorPage` (`src/pages/EditorPage.tsx`): routing, load/save, status management, toolbar UI.
- `ScribbleEditor` (`src/components/Editor.tsx`): TipTap initialization and markdown/html conversion.

### Editor load logic

`EditorPage` loads one of two ways:

- **New doc** (from dashboard navigation state):
  - Uses `location.state` content
  - Sets `sha: ''`
  - Marks status as `uncommitted`
- **Existing doc**:
  - Fetches content via `getFileContent`
  - Fetches repo root listing via `getContents(owner, repo, '')` to find the file and its SHA

### Save/commit model

There is no autosave to GitHub. The model is:

- Typing updates local markdown state and marks status `uncommitted`.
- `Cmd/Ctrl+S` triggers a commit.
- Clicking the “Commit” button triggers a commit.

Commit implementation:

- New doc: `GitHubService.saveFile(...)` (PUT without SHA)
- Existing doc: `GitHubService.updateScribble(...)` (PUT with SHA)

Concurrency protection:

- `isCommitInProgress` ref prevents overlapping commits.

Navigation safety:

- `beforeunload` warns if status is `uncommitted`.
- In-app back navigation shows a “save/discard” dialog if status is `uncommitted`.

### TipTap configuration

`ScribbleEditor` uses:

- `StarterKit` (headings limited to levels 1–3)
- `Placeholder` (special heading placeholder vs normal)
- `Typography`
- `Link` (does not open on click)
- `TaskList` + `TaskItem` (nested)

On each editor update:

- `editor.getHTML()` → converted to markdown via `htmlToMarkdown()`
- Parent receives markdown via `onChange(markdown)`

### Markdown conversion implementation (important limitations)

`src/lib/markdown.ts` provides `markdownToHtml()` and `htmlToMarkdown()` as a minimal bridge so TipTap can operate on HTML while GitHub stores markdown.

Characteristics:

- **Regex-based**, not a full parser.
- Escapes `<`, `>`, `&` early in `markdownToHtml()`.
- Implements headings, emphasis, strike, inline/code blocks, blockquotes, basic lists, task lists, links, and horizontal rules.
- List merging and blockquote merging are handled with simple string replacement.

Implications:

- Edge cases (nested lists, complex inline formatting, mixed blocks) may not round-trip perfectly.
- This is acceptable for the intended lightweight scribble use case, but it’s not a full markdown engine.

## Theming

Theme state lives in `src/hooks/useTheme.tsx`:

- `ThemeMode`: `'day' | 'night'`
- `ThemePalette`: `'sage' | 'kissaten' | 'hygge' | 'parisian' | 'kyoto' | 'cafe'`

Persistence:

- `scribble-theme-mode`
- `scribble-theme-palette`

Application:

- Writes `data-mode` and `data-palette` attributes to `<html>`
- `src/index.css` defines CSS variables for each palette + mode pair

`ThemeToggle` (`src/components/ThemeToggle.tsx`) provides:

- Palette dropdown (optional)
- Day/night toggle

## Error Handling

`src/components/ErrorBoundary.tsx` wraps the app and renders a fallback UI on uncaught React render errors.

Runtime error handling elsewhere is mostly:

- `try/catch` around GitHub API calls
- UI error banners on failures (e.g., “Failed to load documents”)

## Deployment & Hosting

### Vercel

- `vercel.json` routes:
  - `/api/*` → serverless function filesystem route
  - all other paths → `index.html` (SPA routing)
- `api/github-oauth.ts` runs on Edge Runtime and must be deployed with the app (or separately) for auth to work.

### GitHub Pages

- Build uses `npm run build:gh` (`vite build --mode github-pages`)
- Deploy uses `gh-pages -d dist`
- Because GitHub Pages cannot serve Vercel-style functions, the OAuth proxy must be hosted elsewhere and referenced via `VITE_OAUTH_PROXY_URL`.

## Security Considerations (as implemented)

- **Token storage**: `localStorage` is used for simplicity; XSS would expose tokens.
- **OAuth scopes**: `repo user` is broad (needed for private repo access and user info).
- **CORS**: proxy enforces a strict allowlist; misconfiguration could allow unwanted origins.
- **No client secret**: Device Flow avoids shipping secrets, but access tokens are still powerful credentials.


