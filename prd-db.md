Absolutely — here's the fully updated PRD for your project with:

1. SQL schema for all 4 tables  
2. RLS policies (with Supabase Auth support)  
3. An explanation of how to **ensure the user is saved in the `users` table** after Spotify login  

Let’s lock in this foundational layer so the rest of your app can build smoothly on top.

---

# 🎨 Playlist Cover Designer – PRD (with SQL + RLS)

## 🧠 Project Overview

This project is a web app where users can **log in with Spotify** and **customize their playlist covers** in three ways:
1. Choose from their **previously used images**
2. **Generate a new cover with an AI prompt**
3. Use a **DIY Canva-style editor**

---

## 🎯 Goals

- Let users authenticate via Spotify
- Fetch and store Spotify playlists
- Display current and past cover images
- Allow users to set new covers using AI prompt or DIY tool
- Store all images and their origins (AI, uploaded, DIY)
- Associate vibes and cover history with playlists

---

## ⚙️ Database Schema (PostgreSQL for Supabase)

```sql
-- USERS TABLE
create table public.users (
  id uuid primary key default gen_random_uuid(),
  spotify_id text unique not null,
  display_name text,
  email text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- PLAYLISTS TABLE
create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  spotify_id text not null,
  user_id uuid references public.users(id) on delete cascade,
  name text,
  current_cover uuid references public.images(id),
  vibe text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- IMAGES TABLE
create type public.image_type as enum ('ai', 'upload', 'diy');

create table public.images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  playlist_id uuid references public.playlists(id) on delete set null,
  url text not null,
  type image_type not null,
  prompt text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- PLAYLIST HISTORY TABLE (optional)
create table public.playlist_history (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references public.playlists(id) on delete cascade,
  image_id uuid references public.images(id) on delete set null,
  changed_at timestamp with time zone default timezone('utc', now())
);
```

---

## 🔐 Row Level Security (RLS)

Enable RLS for each table:

```sql
-- Enable RLS
alter table public.users enable row level security;
alter table public.playlists enable row level security;
alter table public.images enable row level security;
alter table public.playlist_history enable row level security;
```

### RLS Policies

```sql
-- USERS TABLE POLICIES
create policy "Allow user to access their own user row"
on public.users
for all
using (auth.uid() = id);

-- PLAYLISTS TABLE POLICIES
create policy "Allow access to own playlists"
on public.playlists
for all
using (user_id = auth.uid());

-- IMAGES TABLE POLICIES
create policy "Allow access to own images"
on public.images
for all
using (user_id = auth.uid());

-- PLAYLIST HISTORY POLICIES
create policy "Allow access to own playlist history"
on public.playlist_history
for all
using (
  exists (
    select 1 from public.playlists
    where playlists.id = playlist_history.playlist_id
    and playlists.user_id = auth.uid()
  )
);
```

---

## 🗂 Supabase Storage: `playlist-covers` Bucket

| Feature         | Setup                                 |
| --------------- | ------------------------------------- |
| Bucket name     | `playlist-covers`                     |
| Access          | Public read, private write via RLS    |
| Path convention | `user_id/playlist_id/<timestamp>.png` |

---

## 🧾 Spotify Auth + Sync Logic

### ✅ How to ensure Spotify users appear in your `users` table:

1. **Supabase Auth creates a session**, but *not* an entry in `users` table automatically.
2. You should add a **server-side function (or Next.js API route)** that:
   - Calls Spotify API to fetch user profile after login
   - Inserts or upserts that user into your `users` table

### ✅ Example `upsert` logic after login:

```ts
// In your Next.js callback or middleware after Spotify auth:
const profile = await fetchSpotifyUserProfile(accessToken); // get { id, display_name, email }

await supabase.from("users").upsert({
  id: session.user.id,             // Supabase UUID
  spotify_id: profile.id,
  display_name: profile.display_name,
  email: profile.email,
});
```

### ✅ Why this matters:
This ensures your `users.id = auth.uid()` and that all RLS policies work correctly.

---

## 🧪 Final Notes / Next Steps

- ✅ Database schema complete
- ✅ Secure RLS policies set
- ✅ Strategy to sync Spotify users into `users` table
- 📦 Supabase Storage set for playlist covers