'use client'

import { useUser } from '@stackframe/stack';
import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function Home() {
  const user = useUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header with navigation */}
      <header className="w-full p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">
            <span className="text-[#1DB954]">Spotify</span> Playlist Manager
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link
            href="/user/dashboard"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium text-sm sm:text-base h-10 px-4 sm:px-5"
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-15">
            Manage Your <span className="text-[#1DB954]">Spotify</span> Playlists with Ease
          </h1>

          <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">
            Organize, customize, and enhance your playlist covers all in one place
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-gray-100 dark:bg-[#181818] rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#1DB954]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1DB954]">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">View All Playlists</h3>
              <p className="text-gray-600 dark:text-gray-400">Access and browse through all your Spotify playlists in one clean interface.</p>
            </div>

            <div className="p-6 bg-gray-100 dark:bg-[#181818] rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#1DB954]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1DB954]">
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path>
                  <path d="M5 12h14"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Customize Covers</h3>
              <p className="text-gray-600 dark:text-gray-400">Easily update and customize your playlist covers to personalize your music collection.</p>
            </div>

            <div className="p-6 bg-gray-100 dark:bg-[#181818] rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#1DB954]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1DB954]">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-Time Sync</h3>
              <p className="text-gray-600 dark:text-gray-400">Changes sync instantly with your Spotify account for a seamless experience.</p>
            </div>
          </div>

          <Link
            href="/user/dashboard"
            className="inline-block rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium py-3 px-8 transition-colors text-lg"
          >
            {isLoggedIn ? 'Go to Your Dashboard' : 'Get Started Now'}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Spotify Playlist Manager. Not affiliated with Spotify AB.
        </p>
      </footer>
    </div>
  );
}
