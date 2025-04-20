'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PlaylistOwner {
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
}

export default function Dashboard() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
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

    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/playlists', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch playlists');
        }

        const data = await response.json();
        setPlaylists(data.items || []);
        setLoading(false);
      } catch (err) {
        setError('Error fetching playlists. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchPlaylists();
  }, [accessToken]);

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
        
        {playlists.length === 0 ? (
          <p className="text-lg">No playlists found in your account.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-3 text-left border border-gray-200 dark:border-gray-700">Name</th>
                  <th className="p-3 text-left border border-gray-200 dark:border-gray-700">Owner</th>
                  <th className="p-3 text-left border border-gray-200 dark:border-gray-700">Tracks</th>
                  <th className="p-3 text-left border border-gray-200 dark:border-gray-700">Public</th>
                </tr>
              </thead>
              <tbody>
                {playlists.map((playlist) => (
                  <tr key={playlist.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
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
                    <td className="p-3 border border-gray-200 dark:border-gray-700">{playlist.owner.display_name}</td>
                    <td className="p-3 border border-gray-200 dark:border-gray-700">{playlist.tracks.total}</td>
                    <td className="p-3 border border-gray-200 dark:border-gray-700">{playlist.public ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}