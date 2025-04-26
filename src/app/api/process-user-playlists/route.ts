import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { getSpotifyImageId } from '@/lib/utils';
import { stackServerApp } from '@/stack';

// Helper function to fetch Spotify user profile
async function fetchSpotifyUserProfile(accessToken: string) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Spotify user profile:', error);
    throw error;
  }
}

// Helper function that processes playlists and images in the background
async function getPlaylistsAndImages(accessToken: string, userId: string, spotifyId: string) {
  try {
    // Fetch user playlists
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const playlists = response.data.items;
    console.log(`Processing ${playlists.length} playlists for user ${userId}`);
    const ownedPlaylists = playlists.filter((playlist: { owner: { id: string } }) => playlist.owner.id === spotifyId);
    // Process each playlist
    for (const playlist of ownedPlaylists) {
        console.log(`Processing user playlist: ${playlist.name}`);
        
        // First, check if playlist already exists by spotify_id
        const { data: existingPlaylist } = await supabaseAdmin
        .from('playlists')
        .select('id')
        .eq('spotify_id', playlist.id)
        .single();
        
        // Playlist ID - either existing or new
        const playlist_id = existingPlaylist?.id || uuidv4();
        
        // Insert or update playlist into Supabase
        const { data: playlistData, error: playlistError } = await supabaseAdmin
            .from('playlists')
            .upsert({
            id: playlist_id,
            spotify_id: playlist.id,
            user_id: userId,
            name: playlist.name,
            })
            .select()
            .single();
            
        if (playlistError) {
            console.error('Error upserting playlist:', playlistError);
            continue;
        }
        
        // Fetch playlist cover images
        try {
            const coverResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlist.id}/images`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            });
            
            const coverImages = coverResponse.data;
            
            // If there are cover images, store the first one
            if (coverImages.length > 0) {
            const coverUrl = coverImages[0].url;

            // First, check if cover already exists by spotify image id
            const imageId = getSpotifyImageId(coverUrl);
            const { data: existingImage } = await supabaseAdmin
            .from('images')
            .select('id, url')
            .eq('spotify_image_id', imageId)
            .single();
            
            // If the image already exists, we only update the url
            if (existingImage) {
                if (existingImage.url === coverUrl) {
                console.log(`Image already exists for ${playlist.name}, skipping upload`);
                } else {
                // Update the existing image URL and changed_at
                console.log(`Playlist ${playlist.name} comes from a different CDN, updating URL`);
                await supabaseAdmin
                    .from('images')
                    .update({ url: coverUrl })
                    .eq('id', existingImage.id);
                }
                continue;
            }

            // Otherwise, we need to upload the image
            console.log(`Uploading image for ${playlist.name}`);
            // Image ID - either existing or new
            const image_id = uuidv4();
            
            // Insert image into Supabase
            const { data: imageData, error: imageError } = await supabaseAdmin
                .from('images')
                .upsert({
                id: image_id,
                user_id: userId,
                playlist_id: playlistData.id,
                url: coverUrl,
                type: 'upload', // Assuming existing Spotify covers are 'upload' type
                spotify_image_id: imageId,
                })
                .select()
                .single();
                
            if (imageError) {
                console.error('Error upserting image:', imageError);
                continue;
            }
            
            // Update playlist with current_cover reference
            await supabaseAdmin
                .from('playlists')
                .update({ current_cover: imageData.id })
                .eq('id', playlistData.id);
            }
        } catch (error) {
            console.error(`Error fetching covers for playlist ${playlist.id}:`, error);
        }
    }
    console.log(`Finished processing playlists and images for user ${userId}`);
    return { success: true, message: 'Playlists processed successfully' };
  } catch (error) {
    console.error('Error processing playlists and images:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await stackServerApp.getUser({ or: 'redirect' });
    // Get Spotify access token from the authenticated user and check if it exists
    const account = await user.getConnectedAccount('spotify', { or: 'redirect' });
    const { accessToken } = await account.getAccessToken();
    
    // Check if user exists and is an object (not an empty string)
    if (!user || typeof user === 'string') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No Spotify access token available' }, { status: 400 });
    }
    
    // Fetch Spotify user profile
    const spotifyProfile = await fetchSpotifyUserProfile(accessToken);
    console.log("Spotify profile fetched:", spotifyProfile.id);
    
    // First, check if user already exists by spotify_id
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('spotify_id', spotifyProfile.id)
      .single();
    
    // User ID - either existing or new
    // If the user doesn't exist, we generate a new UUID
    const userId = !existingUser ? uuidv4() : existingUser.id;
    
    console.log("Using user ID:", userId, "existing user:", !!existingUser);
    
    // Insert or update user in the Supabase users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        spotify_id: spotifyProfile.id,
        display_name: spotifyProfile.display_name,
        email: spotifyProfile.email,
      })
      .select()
      .single();
    
    if (userError) {
      console.error('Error upserting user:', userError);
      return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 });
    }
    
    // Process playlists in the background
    // We don't await this so we can return a response immediately
    getPlaylistsAndImages(accessToken, userData.id, spotifyProfile.id)
      .catch(error => console.error('Background processing error:', error));
    
    // Return immediate success response
    return NextResponse.json({ status: 'user-returned', userData: JSON.stringify({
      id: userData.spotify_id,
      display_name: userData.display_name,
    }) }, { status: 200 });
    // return NextResponse.json({ status: 'processing', message: 'Playlist sync started' });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}