'use client'

import { ListMusic, Home, Settings2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ThemeSwitcher from './ThemeSwitcher'
import { usePathname } from 'next/navigation'

interface SpotifyUser {
    id: string;
    display_name: string;
    profileUrl: string;
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
    const pathname = usePathname();

    // Function to check if a path is active
    const isActive = (path: string) => {
        // Exact match for home page
        if (path === '/' && pathname === '/') return true;
        // For other pages, check if the pathname starts with the given path
        // This handles active state for nested routes
        return path !== '/' && pathname.startsWith(path);
    };

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
                        <Link
                            href="/"
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive('/')
                                ? 'bg-gray-200 dark:bg-[#282828] text-[#1DB954] font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#282828]'
                                }`}
                        >
                            <Home size={20} />
                            <span>Home</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/user/dashboard"
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive('/user/dashboard')
                                ? 'bg-gray-200 dark:bg-[#282828] text-[#1DB954] font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#282828]'
                                }`}
                        >
                            <ListMusic size={20} />
                            <span>Playlists</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/user/settings"
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors 
                                ${isActive('/user/settings')
                                    ? 'bg-gray-200 dark:bg-[#282828] text-[#1DB954] font-medium'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#282828]'
                                }`}
                        >
                            <Settings2 size={20} />
                            <span>Settings</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            {currentUser && (
                <div className="p-3 rounded-md bg-gray-200 dark:bg-[#282828]">
                    <p className="font-medium text-sm mb-2">Logged in as:</p>
                    <div className="flex items-center gap-2">
                        <Image src={currentUser.profileUrl} alt="Profile Picture" width={32} height={32} className="w-8 h-8 rounded-full" />
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