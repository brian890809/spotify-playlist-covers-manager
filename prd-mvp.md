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
- **Redirect URI for development**:  
  `http://127.0.0.1:3000/api/callback`  
  This is the registered URI in the Spotify Developer Dashboard.

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
- **Auth**: Spotify OAuth (Authorization Code Flow)
- **Styling**: Tailwind CSS or basic CSS
- **Dev Tools**: `http://127.0.0.1` for local testing

---

### 📈 Future Enhancements (Post-MVP)
- Add ability to search/filter playlists
- Display track previews
- Export playlists to CSV
- Refresh token handling
- Dark mode toggle

---

### ✅ MVP Checklist

| Feature                  | Status |
| ------------------------ | ------ |
| Spotify login button     | ☐      |
| Redirect URI with token  | ☐      |
| Playlist API integration | ☐      |
| Table UI for playlists   | ☐      |
| Basic styling            | ☐      |
