# Cafe Scribble

A beautiful, cozy markdown editor that saves documents directly to your GitHub repository. Designed with warm cafe aesthetics and a distraction-free writing experience.

## ✨ Features

- **Rich Markdown Editor** — Powered by Tiptap with a full formatting toolbar and slash commands (`/`)
- **GitHub-Native Storage** — Your documents are stored as `.md` files in your own repository with full version history
- **OAuth Device Flow** — Secure client-side GitHub authentication (no backend server required)
- **Multiple Themes** — 6 carefully crafted cafe-inspired color palettes with day/night modes
- **Manual Save** — Press `Cmd/Ctrl + S` to commit changes to GitHub with visual status indicators
- **100% Client-Side** — Runs entirely in your browser; your data stays in your GitHub account

## 🚀 Quick Start

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `Cafe Scribble` (or your preferred name)
   - **Homepage URL**: Your deployment URL (e.g., `https://cafescribble.app`)
   - **Authorization callback URL**: Same as homepage URL
4. Click **"Register application"**
5. Copy the **Client ID** (you don't need the Client Secret for Device Flow)

### 2. Configure Environment

Create a `.env` file in the project root:

```env
VITE_GITHUB_CLIENT_ID=your_client_id_here
```

Or set the environment variable in your hosting platform (Vercel, Netlify, etc.).

### 3. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to start using the app.

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

Note: GitHub Pages requires the OAuth proxy to be hosted elsewhere (Vercel recommended for the API).

## 🛡️ Security Considerations

### OAuth & Token Storage

- **GitHub OAuth Device Flow** is used for authentication — no client secret is exposed
- **Access tokens are stored in localStorage** — This is standard for SPAs but vulnerable to XSS attacks
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
- **Vercel Edge Functions** — OAuth proxy (no server required)

## 📁 Project Structure

```
├── api/
│   └── github-oauth.ts    # Vercel Edge Function for OAuth proxy
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks (auth, theme)
│   ├── lib/               # Utilities (markdown conversion, etc.)
│   ├── pages/             # Route pages
│   └── services/          # GitHub API & Auth services
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

*Crafted with ☕ and care. Consider supporting [Seattle Children's Hospital](https://www.seattlechildrens.org/giving).*
