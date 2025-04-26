'use client'

import Sidebar from '@/components/Sidebar';
import { createContext, useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';

interface PlaylistImage {
    url: string;
    height: number;
    width: number;
}

interface PlaylistOwner {
    id: string;
    display_name: string;
}

interface PlaylistTracks {
    total: number;
}

interface PlaylistExternalUrls {
    spotify: string;
}

export interface Playlist {
    id: string;
    name: string;
    owner: PlaylistOwner;
    tracks: PlaylistTracks;
    public: boolean;
    external_urls: PlaylistExternalUrls;
    images?: PlaylistImage[];
}

export interface SpotifyUser {
    id: string;
    display_name: string;
}

// Create context for our Spotify data
export const SpotifyDataContext = createContext<{
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

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [currentUser, setCurrentUser] = useState<SpotifyUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');

    const stackUser = useUser({ or: 'redirect' });
    const account = stackUser.useConnectedAccount('spotify', { or: 'redirect' });

    const handleSignOut = () => {
        // For simplicity, just redirect to the homepage
        window.location.href = '/';
    };

    useEffect(() => {
        // This effect only runs once to start the initial data fetching
        const initialFetch = async () => {
            setLoading(true);

            try {
                // First fetch the user data
                const userData = await fetch('/api/get-user');
                if (!userData.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const user = await userData.json();
                setCurrentUser(user);

                // After we have the user, sync the user data with backend
                const syncUserResponse = await fetch('/api/sync-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ currentUser: user }), // Use the user data we just received
                });

                if (!syncUserResponse.ok) {
                    console.warn('User sync may not have completed successfully');
                }

                // Then fetch playlists
                const playlistsResponse = await fetch('/api/playlists');
                if (!playlistsResponse.ok) {
                    throw new Error('Failed to fetch playlists');
                }

                const data = await playlistsResponse.json();
                const receivedPlaylists = data.playlists || [];
                setPlaylists(receivedPlaylists);
                setLoading(false);
                console.log(`Total playlists received: ${data.total}`);

                // Start syncing playlists
                setSyncStatus('syncing');

                // Sync playlists with backend
                const syncPlaylistResponse = await fetch('/api/sync-playlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        playlists: receivedPlaylists,
                        currentUser: user // Use the user data we just received instead of the state
                    }),
                });

                if (syncPlaylistResponse.ok) {
                    setSyncStatus('completed');
                } else {
                    setSyncStatus('error');
                }
            } catch (err) {
                console.error('Error in data fetching flow:', err);
                setError('Error fetching data. Please try again later.');
                setLoading(false);
                setSyncStatus('error');
            }
        };

        initialFetch();
    }, []); // Only run once on component mount

    return (
        <SpotifyDataContext.Provider value={{ currentUser, playlists, loading, error, syncStatus, setPlaylists }}>
            <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300">
                <Sidebar
                    currentUser={currentUser}
                    syncStatus={syncStatus}
                    onSignOut={handleSignOut}
                />
                <main className="flex-1 md:ml-64">
                    {children}
                </main>
            </div>
        </SpotifyDataContext.Provider>
    );
}