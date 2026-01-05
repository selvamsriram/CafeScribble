# Cafe Scribble

A cozy markdown editor that saves documents directly to your GitHub repository. It’s a React SPA with a small serverless OAuth proxy (required due to CORS on GitHub’s Device Flow endpoints).

## ✨ Features

- **Rich Markdown Editor**: Tiptap editor with a formatting toolbar and a small command menu hint (`/`)
- **GitHub-native storage**: notes are `.md` files committed to a repo you choose (full Git history)
- **GitHub OAuth Device Flow**: login without a client secret; token stored in your browser
- **Multiple themes**: 6 cafe-inspired palettes with day/night modes
- **Manual save**: `Cmd/Ctrl + S` commits changes to GitHub with clear status feedback

## 🚀 Quick Start

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `Cafe Scribble` (or your preferred name)
   - **Homepage URL**: Your deployment URL (e.g., `https://cafescribble.app`)
   - **Authorization callback URL**: Any valid URL you control (Device Flow does not use the callback, but GitHub requires the field)
4. Click **"Register application"**
5. Copy the **Client ID** (you don't need the Client Secret for Device Flow)

### 2. Configure Environment

Create a `.env` file in the project root:

```env
VITE_GITHUB_CLIENT_ID=your_client_id_here
# Optional: point at a deployed OAuth proxy when running the Vite dev server
# VITE_OAUTH_PROXY_URL=https://your-deployed-domain.example/api/github-oauth
```

Or set the environment variable in your hosting platform.

### 3. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

Note: the login flow calls `VITE_OAUTH_PROXY_URL` (defaults to `/api/github-oauth`). The Vite dev server does **not** serve the `api/` directory, so for local auth you must either:

- Run with the Vercel dev server: `npx vercel dev`
- Or set `VITE_OAUTH_PROXY_URL` to a deployed instance of the proxy (Vercel recommended)

## 📦 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variable: `VITE_GITHUB_CLIENT_ID`
3. Deploy — Vercel will automatically use the `api/` folder for serverless functions

### GitHub Pages

```bash
npm run build:gh
npm run deploy
```

Note: GitHub Pages requires the OAuth proxy to be hosted elsewhere (Vercel recommended).

## 🛡️ Security Considerations

### OAuth & Token Storage

- **GitHub OAuth Device Flow** is used for authentication — no client secret is shipped to the browser
- **Access tokens are stored in localStorage** — convenient for an SPA, but increases impact of XSS
- Tokens are validated on each session start and invalidated on logout

### CORS Configuration

The OAuth proxy (`api/github-oauth.ts`) uses a strict origin allowlist. **Before deploying to production:**

1. Update the `allowedOrigins` array with your actual domains
2. Remove localhost entries if not needed in production
3. **Never use wildcard patterns** like `*.vercel.app`

### Content Security

- All GitHub API calls use the authenticated user's token
- File paths are sanitized to prevent path traversal attacks
- No user-generated HTML is rendered unsanitized

## 🎨 Themes

Cafe Scribble includes 6 hand-crafted themes:

| Theme | Description |
|-------|-------------|
| **Sage Garden** | Warm cream with sage green accents |
| **Japanese Kissaten** | Retro coffee house, warm sienna tones |
| **Copenhagen Hygge** | Scandinavian minimalism, burnt orange |
| **Parisian Salon** | French elegance, terracotta & forest |
| **Kyoto Garden** | Zen matcha greens, serene & calm |
| **Modern Café** | Rich espresso & warm caramel tones |

Each theme supports both day and night modes.

## 🛠️ Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** with custom CSS theme variables
- **Tiptap** — Headless rich text editor
- **Radix UI** — Accessible dialog components
- **GitHub API** — Repository and file operations
- **Vercel Edge Runtime** — OAuth proxy in `api/github-oauth.ts`

## 📁 Project Structure

```
├── api/
│   └── github-oauth.ts    # Edge Runtime function: GitHub OAuth proxy
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks (auth, theme)
│   ├── lib/               # Utilities (markdown conversion, etc.)
│   ├── pages/             # Route pages
│   └── services/          # GitHub API & Auth services
├── DESIGN.md              # Detailed design doc (maps to the code)
├── public/                # Static assets
└── index.html             # Entry point
```

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for GitHub Pages
npm run build:gh

# Lint code
npm run lint

# Preview production build
npm run preview
```

## 📝 How It Works

1. **Login** — User authenticates via GitHub Device Flow (enter code on GitHub)
2. **Select Repository** — Choose an existing repo or create a new one for storing notes
3. **Write** — Use the rich editor with markdown support and slash commands
4. **Save** — Press `Cmd/Ctrl + S` to commit changes directly to GitHub
5. **Access Anywhere** — Your notes are in your GitHub repo, accessible from any device

## 📄 License

MIT

---

Consider supporting [Seattle Children's Hospital](https://www.seattlechildrens.org/giving).
