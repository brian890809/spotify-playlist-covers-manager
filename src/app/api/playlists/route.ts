import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { stackServerApp } from '@/stack';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await stackServerApp.getUser({ or: 'redirect' });
    const account = await user.getConnectedAccount('spotify', { or: 'redirect' });
    const { accessToken } = await account.getAccessToken();
    // Check if user exists and is an object (not an empty string)
    if (!user || typeof user === 'string') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get Spotify access token from the authenticated user and check if it exists
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No Spotify access token available' }, { status: 400 });
    }
    
    // For backward compatibility - still respect the token in the Authorization header if provided
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.split(' ')[1];
    
    // Use the token from the header if available, otherwise use the one from Stack Auth
    const token = headerToken || accessToken;

    // Fetch user's playlists
    const playlistResponse = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const playlists = playlistResponse.data.items || [];
    
    // Fetch cover images for each playlist
    const playlistsWithCovers = await Promise.all(
      playlists.map(async (playlist : { id: string; name: string; }) => {
        try {
          const coverResponse = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlist.id}/images`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (coverResponse.status === 200) {
            return { ...playlist, images: coverResponse.data };
          }

          return playlist;
        } catch (err) {
          console.error(`Error fetching cover for playlist ${playlist.id}:`, err);
          return playlist;
        }
      })
    );

    return NextResponse.json({ 
      ...playlistResponse.data,
      items: playlistsWithCovers 
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}