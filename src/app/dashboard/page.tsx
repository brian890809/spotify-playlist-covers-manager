'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SpotifyImageDialog from '@/components/SpotifyImageDialog';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { Home, Music2, ListMusic } from 'lucide-react';
import { uploadPlaylistCover } from './functions';
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
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [showOnlyOwnedPlaylists, setShowOnlyOwnedPlaylists] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ url: string, alt: string, name: string, ownerId: string } | null>(null);

    const stackUser = useUser({ or: 'redirect' });
    const account = stackUser.useConnectedAccount('spotify', { or: 'redirect' });
    const { accessToken } = account.useAccessToken();

    useEffect(() => {
        if (!stackUser || !accessToken) {
            setError('Authentication error. Please login again.');
            setLoading(false);
            return;
        }

        const processPlaylists = async () => {
            try {
                setSyncStatus('syncing');
                const response = await fetch('/api/process-user-playlists');

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error processing playlists:', errorData);
                    setSyncStatus('error');
                    return;
                }

                const data = await response.json();
                const userData = JSON.parse(data.userData);
                setCurrentUser(userData);
                setSyncStatus('completed');
            } catch (error) {
                console.error('Error syncing playlists:', error);
                setSyncStatus('error');
            }
        };

        const fetchPlaylists = async () => {
            try {
                const playlistsResponse = await fetch('/api/playlists');

                if (!playlistsResponse.ok) {
                    throw new Error('Failed to fetch playlists');
                }

                const data = await playlistsResponse.json();

                setPlaylists(data.items || []);
                await processPlaylists();
                setLoading(false);
            } catch (err) {
                setError('Error fetching data. Please try again later.');
                setLoading(false);
                console.error(err);
            }
        };

        fetchPlaylists();
    }, [accessToken, stackUser]);

    const filteredPlaylists = showOnlyOwnedPlaylists && currentUser
        ? playlists.filter(playlist => playlist.owner.id === currentUser.id)
        : playlists;

    const openImageDialog = (imageUrl: string, playlistName: string, ownerId: string) => {
        setSelectedImage({
            url: imageUrl,
            alt: `${playlistName} cover`,
            name: playlistName,
            ownerId: ownerId
        });
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) setSelectedImage(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#121212] p-8 flex items-center justify-center transition-colors duration-300">
                <div className="text-lg text-gray-800 dark:text-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="animate-spin w-6 h-6 border-2 border-[#1DB954] border-t-transparent rounded-full"></div>
                        Loading your playlists...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#121212] p-8 flex flex-col items-center justify-center transition-colors duration-300">
                <p className="text-lg text-red-500 mb-4">{error}</p>
                <Link
                    href="/"
                    className="rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium py-2 px-6 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        );
    }

    console.log(currentUser)

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300">
            <div className="w-full md:w-64 bg-gray-100 dark:bg-[#000000] p-4 md:p-6 shadow-md md:fixed md:h-screen md:overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold">
                        <span className="text-[#1DB954]">Spotify</span> Playlists
                    </h1>
                    <ThemeSwitcher />
                </div>

                <nav className="mb-8">
                    <ul className="space-y-2">
                        <li>
                            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#282828] transition-colors">
                                <Home size={20} />
                                <span>Home</span>
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-gray-200 dark:bg-[#282828] text-black dark:text-white font-medium">
                                <ListMusic size={20} />
                                <span>Playlists</span>
                            </div>
                        </li>
                    </ul>
                </nav>

                {currentUser && (
                    <div className="p-3 rounded-md bg-gray-200 dark:bg-[#282828]">
                        <p className="font-medium text-sm mb-2">Logged in as:</p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center text-white font-bold">
                                {currentUser.display_name.charAt(0)}
                            </div>
                            <span className="font-semibold">{currentUser.display_name}</span>
                        </div>

                        {syncStatus === 'syncing' && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <div className="animate-spin w-3 h-3 border border-[#1DB954] border-t-transparent rounded-full"></div>
                                <span>Syncing playlists...</span>
                            </div>
                        )}

                        {syncStatus === 'completed' && (
                            <div className="mt-3 text-sm text-green-600 dark:text-green-400">
                                Playlists synced
                            </div>
                        )}

                        {syncStatus === 'error' && (
                            <div className="mt-3 text-sm text-red-600 dark:text-red-400">
                                Sync error
                            </div>
                        )}

                        <div className="mt-3">
                            <button
                                onClick={() => {
                                    if (stackUser) {
                                        stackUser.signOut();
                                    }
                                }}
                                className="text-sm text-gray-700 dark:text-gray-300 hover:text-[#1DB954] dark:hover:text-[#1DB954] transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-auto md:ml-64">
                <div className="max-w-5xl">
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Your Playlists</h2>
                        <Link
                            href="/"
                            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium text-sm h-10 px-5"
                        >
                            Return to Home
                        </Link>
                    </div>

                    {currentUser && (
                        <div className="mb-6">
                            <button
                                onClick={() => setShowOnlyOwnedPlaylists(!showOnlyOwnedPlaylists)}
                                className={`rounded-full py-2 px-4 text-sm font-medium transition-all duration-200 ${showOnlyOwnedPlaylists
                                    ? 'bg-[#1DB954] text-white'
                                    : 'bg-gray-200 dark:bg-[#282828] text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#333333]'
                                    }`}
                            >
                                My Playlists
                            </button>
                        </div>
                    )}

                    {filteredPlaylists.length === 0 ? (
                        <div className="p-6 rounded-lg bg-gray-100 dark:bg-[#282828] text-center">
                            <p className="text-lg">
                                {showOnlyOwnedPlaylists
                                    ? "You don't own any playlists. Disable the filter to see all playlists."
                                    : "No playlists found in your account."}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                Showing {filteredPlaylists.length} playlists
                                {showOnlyOwnedPlaylists ? " (owned by you)" : ""}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredPlaylists.map((playlist) => (
                                    <div
                                        key={playlist.id}
                                        className="p-4 rounded-md bg-gray-100 dark:bg-[#181818] hover:bg-gray-200 dark:hover:bg-[#282828] transition-colors shadow-sm"
                                    >
                                        <div
                                            className="relative w-full aspect-square mb-3 cursor-pointer rounded-md overflow-hidden shadow-md group"
                                            onClick={() => playlist.images && playlist.images.length > 0 &&
                                                openImageDialog(playlist.images[0].url, playlist.name, playlist.owner.id)}
                                        >
                                            {playlist.images && playlist.images.length > 0 ? (
                                                <>
                                                    <Image
                                                        src={playlist.images[0].url}
                                                        alt={`${playlist.name} cover`}
                                                        fill
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <div className="bg-[#1DB954] text-white p-3 rounded-full">
                                                            <Music2 size={24} />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">No cover</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <a
                                                href={playlist.external_urls.spotify}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-lg font-bold hover:text-[#1DB954] transition-colors mb-1 line-clamp-1"
                                            >
                                                {playlist.name}
                                            </a>
                                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    {currentUser && playlist.owner.id === currentUser.id ? (
                                                        <span className="bg-[#1DB954] bg-opacity-20 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                                            Your Playlist
                                                        </span>
                                                    ) : (
                                                        <span>By {playlist.owner.display_name}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span>{playlist.tracks.total} tracks</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedImage && (
                <SpotifyImageDialog
                    isOpen={!!selectedImage}
                    onOpenChange={handleOpenChange}
                    imageUrl={selectedImage.url}
                    altText={selectedImage.alt}
                    playlistName={selectedImage.name}
                    canEdit={currentUser && selectedImage.ownerId === currentUser.id}
                    playlistId={playlists.find(p => p.name === selectedImage.name)?.id || ''}
                    userId={currentUser?.id || ''}
                    onImageUpload={async (file: File) => {
                        if (!accessToken || !currentUser) return;

                        try {
                            const playlistId = playlists.find(p => p.name === selectedImage.name)?.id;
                            if (!playlistId) {
                                throw new Error('Playlist ID not found');
                            }

                            const imageUrl = await uploadPlaylistCover(
                                accessToken,
                                playlistId,
                                file,
                                currentUser.id
                            );

                            setSelectedImage(prev => prev ? {
                                ...prev,
                                url: imageUrl
                            } : null);

                            setPlaylists(prev => prev.map(p => {
                                if (p.id === playlistId && p.images && p.images.length > 0) {
                                    return {
                                        ...p,
                                        images: [{
                                            url: imageUrl,
                                            height: p.images[0].height,
                                            width: p.images[0].width
                                        }, ...p.images.slice(1)]
                                    };
                                }
                                return p;
                            }));
                        } catch (error) {
                            console.error('Error uploading playlist cover:', error);
                            alert('Failed to upload image. Please try again.');
                        }
                    }}
                />
            )}
        </div>
    );
}