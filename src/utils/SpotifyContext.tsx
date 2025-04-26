import { createContext } from "react";

import { SpotifyUser, Playlist } from "@/app/user/layout";

// Create context for our Spotify data
const SpotifyDataContext = createContext<{
    currentUser: SpotifyUser | null;
    playlists: Playlist[];
    loading: boolean;
    error: string | null;
    syncStatus: 'idle' | 'syncing' | 'completed' | 'error';
    setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
}>({
    currentUser: null,
    playlists: [],
    loading: true,
    error: null,
    syncStatus: 'idle',
    setPlaylists: () => { },
});

export default SpotifyDataContext;