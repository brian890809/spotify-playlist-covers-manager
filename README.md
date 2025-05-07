
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
# Stack credentials
NEXT_PUBLIC_STACK_PROJECT_ID=
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=
STACK_SECRET_SERVER_KEY=

# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=

# Gen AI key
DEFAULT_GEMINI_API_KEY=
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
