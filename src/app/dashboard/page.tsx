'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SpotifyImageDialog from '@/components/SpotifyImageDialog';

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

interface Playlist {
    id: string;
    name: string;
    owner: PlaylistOwner;
    tracks: PlaylistTracks;
    public: boolean;
    external_urls: PlaylistExternalUrls;
    images?: PlaylistImage[];
}

interface SpotifyUser {
    id: string;
    display_name: string;
}

export default function Dashboard() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [currentUser, setCurrentUser] = useState<SpotifyUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOnlyOwnedPlaylists, setShowOnlyOwnedPlaylists] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ url: string, alt: string, name: string } | null>(null);

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
                // Fetch current user first
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

                // Then fetch playlists
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

    // Filter playlists based on ownership
    const filteredPlaylists = showOnlyOwnedPlaylists && currentUser
        ? playlists.filter(playlist => playlist.owner.id === currentUser.id)
        : playlists;

    // Open dialog with the selected image
    const openImageDialog = (imageUrl: string, playlistName: string) => {
        setSelectedImage({
            url: imageUrl,
            alt: `${playlistName} cover`,
            name: playlistName
        });
    };

    // Handle dialog open state change
    const handleOpenChange = (open: boolean) => {
        if (!open) setSelectedImage(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center">
                <p className="text-lg">Loading your playlists...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-8 flex flex-col items-center justify-center">
                <p className="text-lg text-red-500 mb-4">{error}</p>
                <Link
                    href="/"
                    className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-auto"
                >
                    Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Your Spotify Playlists</h1>
                    <Link
                        href="/"
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
                    >
                        Return to Home
                    </Link>
                </div>

                {currentUser && (
                    <div className="mb-6">
                        <p className="mb-2">Logged in as: <span className="font-semibold">{currentUser.display_name}</span></p>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="owned-filter"
                                checked={showOnlyOwnedPlaylists}
                                onChange={() => setShowOnlyOwnedPlaylists(!showOnlyOwnedPlaylists)}
                                className="mr-2 h-4 w-4"
                            />
                            <label htmlFor="owned-filter" className="text-sm font-medium">
                                Show only playlists I own
                            </label>
                        </div>
                    </div>
                )}

                {filteredPlaylists.length === 0 ? (
                    <p className="text-lg">
                        {showOnlyOwnedPlaylists
                            ? "You don't own any playlists. Disable the filter to see all playlists."
                            : "No playlists found in your account."}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <p className="mb-2 text-sm">
                            Showing {filteredPlaylists.length} playlists
                            {showOnlyOwnedPlaylists ? " (owned by you)" : ""}
                        </p>
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th className="p-3 text-left border border-gray-200 dark:border-gray-700">Cover</th>
                                    <th className="p-3 text-left border border-gray-200 dark:border-gray-700">Name</th>
                                    <th className="p-3 text-left border border-gray-200 dark:border-gray-700">Owner</th>
                                    <th className="p-3 text-left border border-gray-200 dark:border-gray-700">Tracks</th>
                                    <th className="p-3 text-left border border-gray-200 dark:border-gray-700">Public</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlaylists.map((playlist) => (
                                    <tr key={playlist.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <td className="p-3 border border-gray-200 dark:border-gray-700 w-24">
                                            {playlist.images && playlist.images.length > 0 ? (
                                                <div
                                                    className="relative w-16 h-16 cursor-pointer group"
                                                    onClick={() => openImageDialog(playlist.images![0].url, playlist.name)}
                                                >
                                                    <Image
                                                        src={playlist.images[0].url}
                                                        alt={`${playlist.name} cover`}
                                                        fill
                                                        sizes="64px"
                                                        style={{ objectFit: 'cover' }}
                                                        className="rounded"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                                        <div className="text-white text-xs bg-black/50 px-2 py-1 rounded-full">
                                                            View
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">No cover</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 border border-gray-200 dark:border-gray-700">
                                            <a
                                                href={playlist.external_urls.spotify}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {playlist.name}
                                            </a>
                                        </td>
                                        <td className="p-3 border border-gray-200 dark:border-gray-700">
                                            {playlist.owner.display_name}
                                            {currentUser && playlist.owner.id === currentUser.id && (
                                                <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">You</span>
                                            )}
                                        </td>
                                        <td className="p-3 border border-gray-200 dark:border-gray-700">{playlist.tracks.total}</td>
                                        <td className="p-3 border border-gray-200 dark:border-gray-700">{playlist.public ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Spotify-styled Image Dialog */}
            {selectedImage && (
                <SpotifyImageDialog
                    isOpen={!!selectedImage}
                    onOpenChange={handleOpenChange}
                    imageUrl={selectedImage.url}
                    altText={selectedImage.alt}
                    playlistName={selectedImage.name}
                />
            )}
        </div>
    );
}