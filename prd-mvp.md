Perfect! Here's an **enhanced PRD** that now includes the **skeleton code** for:

- Implementing the **Authorization Code Flow**
- Creating the **callback API route**
- Using the **access token** to fetch playlists

---

## 📄 Product Requirements Document (PRD)

### 🛠️ Project Name:
**Spotify Playlist Viewer**

---

### 📌 Objective:
To create a simple web application that allows users to log in with their Spotify account and view their playlists in a clean, tabular format.

---

### 🎯 Goals:
- Authenticate users via Spotify OAuth
- Fetch and display user playlists using Spotify Web API
- Display playlists in a well-structured table layout
- Focus on clean UI and smooth user experience

---

### 👤 Target Users:
- Spotify users interested in viewing and managing their playlists through a custom interface
- Developers or hobbyists learning about OAuth, Spotify API, and modern frontend frameworks

---

### 🔐 Features

#### 1. **Spotify Login Integration**
- Implement Spotify Authorization Code Flow
- Redirect users to Spotify login
- Handle callback and exchange code for access token

##### ✅ Redirect URI for development:
```
http://127.0.0.1:3000/api/callback
```

#### 2. **User Playlist Fetching**
- Use access token to call `GET /v1/me/playlists`
- Retrieve playlist name, number of tracks, and owner

#### 3. **Display in Table Format**
- Render playlists in a table with the following columns:
  - Playlist Name (clickable to open in Spotify)
  - Owner
  - Track Count
  - Public/Private Status

#### 4. **Session Handling (optional for MVP)**
- Store token in-memory or in cookies/session
- Optionally support re-authentication

---

### 🖥️ UI Requirements

#### Landing Page:
- Simple page with a "Login with Spotify" button

#### Dashboard Page:
- Table showing user playlists
- Table styling:
  - Use basic CSS or Tailwind (depending on tech stack)
  - Responsive for mobile/tablet/desktop

---

### 📶 API Integrations

- **Spotify Authorization URL**
  ```
  https://accounts.spotify.com/authorize
  ```

- **Token Exchange Endpoint**
  ```
  https://accounts.spotify.com/api/token
  ```

- **Fetch User Playlists**
  ```
  GET https://api.spotify.com/v1/me/playlists
  ```

---

### ⚙️ Tech Stack

- **Frontend**: Next.js + React
- **Backend**: API Routes (Next.js)
- **Auth**: Spotify OAuth (Authorization Code Flow), Axios for API calls
- **Styling**: Tailwind CSS or basic CSS
- **Dev Tools**: `http://127.0.0.1` for local testing

---

## 🧱 Skeleton Code

### 1. **Redirect to Spotify Authorization**

```tsx
// components/LoginButton.tsx
const LoginButton = () => {
  const redirectToSpotify = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
    const redirectUri = 'http://127.0.0.1:3000/api/callback';
    const scopes = ['playlist-read-private', 'playlist-read-collaborative'];

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes.join('%20')}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = authUrl;
  };

  return <button onClick={redirectToSpotify}>Login with Spotify</button>;
};

export default LoginButton;
```

---

### 2. **Create Callback API Route**

```ts
// pages/api/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;

  const tokenResponse = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://127.0.0.1:3000/api/callback',
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const { access_token } = tokenResponse.data;

  // Pass token to dashboard page
  res.redirect(`/dashboard?access_token=${access_token}`);
}
```

---

### 3. **Use Access Token to Fetch Playlists**

```ts
// pages/api/playlists.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const playlistResponse = await axios.get('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  res.status(200).json(playlistResponse.data);
}
```

---

### 4. **Render Playlists in a Table**

```tsx
// pages/dashboard.tsx
import { useEffect, useState } from 'react';

export default function Dashboard({ access_token }: { access_token: string }) {
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/playlists', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then(res => res.json())
      .then(data => setPlaylists(data.items || []));
  }, [access_token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Playlists</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Owner</th>
            <th className="p-2 border">Tracks</th>
            <th className="p-2 border">Public</th>
          </tr>
        </thead>
        <tbody>
          {playlists.map(p => (
            <tr key={p.id}>
              <td className="p-2 border">
                <a href={p.external_urls.spotify} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {p.name}
                </a>
              </td>
              <td className="p-2 border">{p.owner.display_name}</td>
              <td className="p-2 border">{p.tracks.total}</td>
              <td className="p-2 border">{p.public ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### ✅ MVP Checklist

| Feature                  | Status |
| ------------------------ | ------ |
| Spotify login button     | ✅      |
| Redirect URI with token  | ✅      |
| Playlist API integration | ✅      |
| Table UI for playlists   | ✅      |
| Basic styling            | ✅      |
