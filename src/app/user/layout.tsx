'use client'

import Sidebar from '@/components/Sidebar';
import { createContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

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
    setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
}>({
    currentUser: null,
    playlists: [],
    loading: true,
    error: null,
    setPlaylists: () => { },
});

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [currentUser, setCurrentUser] = useState<SpotifyUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const accessToken = searchParams.get('access_token');

    useEffect(() => {
        if (!accessToken) {
            setError('No access token found. Please login again.');
            setLoading(false);
            return;
        }

        const fetchUserAndPlaylists = async () => {
            try {
                const userResponse = await fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user information');
                }

                const userData = await userResponse.json();
                setCurrentUser(userData);

                const playlistsResponse = await fetch('/api/playlists', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!playlistsResponse.ok) {
                    throw new Error('Failed to fetch playlists');
                }

                const data = await playlistsResponse.json();
                const playlistsWithoutCovers = data.items || [];

                const playlistsWithCovers = await Promise.all(
                    playlistsWithoutCovers.map(async (playlist: Playlist) => {
                        try {
                            const coverResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/images`, {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                },
                            });

                            if (coverResponse.ok) {
                                const coverImages = await coverResponse.json();
                                return { ...playlist, images: coverImages };
                            }

                            return playlist;
                        } catch (err) {
                            console.error(`Error fetching cover for playlist ${playlist.id}:`, err);
                            return playlist;
                        }
                    })
                );

                setPlaylists(playlistsWithCovers);
                setLoading(false);
            } catch (err) {
                setError('Error fetching data. Please try again later.');
                setLoading(false);
                console.error(err);
            }
        };

        fetchUserAndPlaylists();
    }, [accessToken]);

    return (
        <SpotifyDataContext.Provider value={{ currentUser, playlists, loading, error, setPlaylists }}>
            <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300">
                <Sidebar currentUser={currentUser} />
                <main className="flex-1 md:ml-64">
                    {children}
                </main>
            </div>
        </SpotifyDataContext.Provider>
    );
}