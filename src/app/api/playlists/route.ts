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

    const playlistResponse = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(playlistResponse.data);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}