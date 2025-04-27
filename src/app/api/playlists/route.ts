import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosResponse } from 'axios';
import { stackServerApp } from '@/stack';

// Define interfaces for Spotify API response structure
interface PlaylistOwner {
  display_name: string;
  external_urls: { spotify: string };
  href: string;
  id: string;
  type: string;
  uri: string;
}

interface PlaylistTrackInfo {
  href: string;
  total: number;
}

interface SimplifiedPlaylist {
    // Continue fetching until there's no next URL
  name: string;
  owner: PlaylistOwner;
  public: boolean | null;
  snapshot_id: string;
  tracks: PlaylistTrackInfo;
  type: string;
  uri: string;
}

interface SpotifyPagingObject<T> {
  href: string;
  items: T[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

type SpotifyPlaylistsResponse = SpotifyPagingObject<SimplifiedPlaylist>;


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
    // Fetch all playlists with pagination
    let allPlaylists: SimplifiedPlaylist[] = [];
    let nextUrl: string | null = 'https://api.spotify.com/v1/me/playlists?limit=50';
    
    // Continue fetching until there's no next URL
    while (nextUrl) {
      const response: AxiosResponse<SpotifyPlaylistsResponse> = await axios.get(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log('Number of playlists total:', response.data.total)
      // Add playlists to our collection
      allPlaylists = [...allPlaylists, ...response.data.items];
      
      // Get next URL or set to null to end the loop
      nextUrl = response.data.next;
    }
    
    console.log(`Total playlists fetched: ${allPlaylists.length}`);
    
    return NextResponse.json({ 
      playlists: allPlaylists,
      total: allPlaylists.length
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}