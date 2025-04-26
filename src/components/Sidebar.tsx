'use client'
import { ListMusic, Home } from 'lucide-react'
import Link from 'next/link'
import ThemeSwitcher from './ThemeSwitcher'

interface SpotifyUser {
    id: string;
    display_name: string;
}

export default function Sidebar({
    currentUser,
    syncStatus = 'idle',
    onSignOut
}: {
    currentUser: SpotifyUser | null;
    syncStatus?: 'idle' | 'syncing' | 'completed' | 'error';
    onSignOut?: () => void;
}) {
    return (
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

                    {onSignOut && (
                        <div className="mt-3">
                            <button
                                onClick={onSignOut}
                                className="text-sm text-gray-700 dark:text-gray-300 hover:text-[#1DB954] dark:hover:text-[#1DB954] transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}