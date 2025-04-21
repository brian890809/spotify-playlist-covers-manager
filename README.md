
# 🎨 Playlist Cover Designer

A fun web app that lets users log in with **Spotify** and design custom cover art for their playlists.  
Users can:
- Pick from previous cover images
- Generate new ones with AI prompts
- Use a DIY Canva-style tool (coming soon!)

---

## 🚧 Status

> **This project is a work in progress.**  
We're actively building features and refining the UI. Feedback is welcome, but please be mindful this is not production-ready.

---

## 🔐 Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/playlist-cover-designer.git
cd playlist-cover-designer
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Add environment variables

Create a `.env.local` file with your own API credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

SPOTIFY_CLIENT_ID=your-spotify-client-id
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/callback

NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-stack-publishable-client-key
STACK_SECRET_SERVER_KEY=your-stack-secret-server-key
```

> 🔑 **Important:** You must supply your own Spotify and Supabase keys.  
We do not include any API credentials in this repo.

---

## 📦 Tech Stack

- **Next.js** – Web app framework
- **Supabase** – Database, storage, and auth
- **Spotify API** – Playlist data and user auth
- **Image Generation (AI)** – Coming soon

---

## ⚠️ License & Usage

> This is a **public repository**, but **not open-source** for unrestricted use.

All content and code is **copyright © Bohan**.

You **may not** reuse, redistribute, or commercialize this project without express permission.

---

## 🙌 Contributions

Feel free to fork and explore, but please contact the author before submitting PRs or using it elsewhere.

---

## 📬 Contact

Questions? Ideas?  
DM [@brian890809](https://github.com/brian890809) or open an issue.
