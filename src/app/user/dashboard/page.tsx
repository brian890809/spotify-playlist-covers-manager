'use client'

import { useState, useContext } from 'react';
import Image from 'next/image';
import SpotifyImageDialog from '@/components/SpotifyImageDialog';
import { Music2 } from 'lucide-react';
import { onImageUpload } from '@/lib/upload-image';
import SpotifyDataContext from '@/utils/SpotifyContext';

export default function DashboardPage() {
    const [showOnlyOwnedPlaylists, setShowOnlyOwnedPlaylists] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ url: string, alt: string, name: string, ownerId: string } | null>(null);

    // Access data from the parent layout using context
    const { currentUser, playlists, loading, error, setPlaylists } = useContext(SpotifyDataContext);

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
            <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
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
            <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center">
                <p className="text-lg text-red-500 mb-4">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8 overflow-auto">
            <div className="max-w-7xl">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Your Playlists</h2>
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
                        await onImageUpload(
                            file,
                            currentUser,
                            playlists,
                            selectedImage,
                            setSelectedImage,
                            setPlaylists
                        );
                    }}
                />
            )}
        </div>
    );
}