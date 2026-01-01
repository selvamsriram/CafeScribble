# Cafe-Scribble - Cozy Markdown Editor with GitHub Storage

A beautiful, cafe-inspired markdown editor that saves your documents directly to a GitHub repository. 100% client-side, no backend required.

## Features

- **Rich Markdown Editor** - Powered by Tiptap with floating menus, slash commands-style interface
- **GitHub-Native Storage** - Your documents are stored as `.md` files in your own repository
- **OAuth Device Flow Authentication** - Secure client-side GitHub login (no backend needed)
- **Auto-Save** - Changes are automatically saved after 2 seconds of inactivity
- **Beautiful UI** - Cozy cafe-themed design with warm colors and gentle animations

## Setup

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Cafe-Scribble (or your preferred name)
   - **Homepage URL**: `https://YOUR_USERNAME.github.io/cafe-scribble` (or `http://localhost:5173` for development)
   - **Authorization callback URL**: `https://YOUR_USERNAME.github.io/cafe-scribble/callback` (or `http://localhost:5173/callback` for development)
4. Click "Register application"
5. Copy the **Client ID**

### 2. Configure the App

Edit `src/services/auth.ts` and replace `YOUR_GITHUB_CLIENT_ID` with your actual Client ID:

```typescript
const GITHUB_CLIENT_ID = 'Ov23liXXXXXXXXXXXXXX';
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## Deployment to GitHub Pages

### Option 1: Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to GitHub Pages

### Option 2: GitHub Actions (Recommended)

1. In your repository settings, go to Pages
2. Set source to "GitHub Actions"
3. Push to main branch - the included workflow will handle deployment

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Shadcn/UI** components
- **Tiptap** - Headless rich text editor
- **GitHub API** - For repository and file operations
- **GitHub OAuth Device Flow** - Client-side authentication

## How It Works

1. User logs in with GitHub (OAuth Device Flow - no backend needed)
2. User selects or creates a repository for storing documents
3. All markdown files in the repository root are listed as scribbles
4. Documents are edited in a rich WYSIWYG editor
5. Changes are auto-saved as commits to the repository

## License

MIT
