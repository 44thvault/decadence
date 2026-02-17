# DECADENCE ⌁ Pandemonium Matrix

Technopunk interface to the CCRU Decadence / Subdecadence card game and Pandemonium oracle system.

## Quick Deploy Options

### Option 1: Vercel (Easiest — free, ~2 minutes)

1. Go to [github.com/new](https://github.com/new) and create a new repo
2. Push this folder to it:
   ```bash
   cd deploy
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Go to [vercel.com](https://vercel.com), sign in with GitHub
4. Click "Add New Project" → Import your repo
5. It auto-detects Vite — just click **Deploy**
6. Done. You get a URL like `your-project.vercel.app`

### Option 2: Netlify (Also free, ~2 minutes)

1. Push to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com), sign in with GitHub
3. "Add new site" → "Import an existing project" → pick your repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Click Deploy

### Option 3: GitHub Pages (Free, no account needed beyond GitHub)

1. Push to GitHub
2. Install gh-pages: add to package.json scripts:
   ```json
   "deploy": "vite build && npx gh-pages -d dist"
   ```
3. Add `base: '/YOUR_REPO_NAME/'` to vite.config.js
4. Run `npm run deploy`

### Option 4: Run Locally

```bash
cd deploy
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

Output goes to `dist/` — upload that folder anywhere (any static host).

## Custom Domain

On Vercel or Netlify, go to your project settings → Domains → add your domain and update DNS.
