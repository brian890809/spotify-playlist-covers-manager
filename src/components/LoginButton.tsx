'use client'

import { useState, useEffect } from 'react';
import { SPOTIFY_SCOPES } from '@/lib/spotify-scope';

const LoginButton = () => {
    const [clientId, setClientId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Get client ID from environment variable
        const id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
        if (!id) {
            setError('Spotify Client ID is not configured');
        } else {
            setClientId(id);
        }
    }, []);

    const redirectToSpotify = () => {
        if (!clientId) {
            alert('Spotify Client ID is not configured. Please check your environment variables.');
            return;
        }

        const redirectUri = 'http://127.0.0.1:3000/api/callback';
        const scopes = SPOTIFY_SCOPES;

        const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes.join('%20')}&redirect_uri=${encodeURIComponent(redirectUri)}`;

        window.location.href = authUrl;
    };

    if (error) {
        return (
            <div>
                <button
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-red-500 text-white gap-2 hover:bg-red-600 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                    onClick={() => alert(error)}
                >
                    Login Error
                </button>
                <p className="text-sm text-red-500 mt-2">Configuration error: {error}</p>
            </div>
        );
    }

    return (
        <button
            onClick={redirectToSpotify}
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-green-500 text-white gap-2 hover:bg-green-600 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            disabled={!clientId}
        >
            Login with Spotify
        </button>
    );
};

export default LoginButton;