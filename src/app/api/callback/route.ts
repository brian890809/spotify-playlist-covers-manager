import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
async function processPlaylistsAndImages(accessToken: string, userId: string, spotifyId: string) {
  try {
    // Fetch user playlists
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const playlists = response.data.items;
    console.log(`Processing ${playlists.length} playlists for user ${userId}`);
    
    // Process each playlist
    for (const playlist of playlists) {
      // Check if this is the user's own playlist (owner.id matches spotify_id)
      if (playlist.owner.id === spotifyId) {
        console.log(`Processing user playlist: ${playlist.name}`);
        
        // Insert playlist into Supabase
        const { data: playlistData, error: playlistError } = await supabaseAdmin
          .from('playlists')
          .upsert({
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
            console.log(`Found cover image for ${playlist.name}`);
            
            // Insert image into Supabase
            const { data: imageData, error: imageError } = await supabaseAdmin
              .from('images')
              .upsert({
                user_id: userId,
                playlist_id: playlistData.id,
                url: coverUrl,
                type: 'upload', // Assuming existing Spotify covers are 'upload' type
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
              
            // Add to playlist history
            await supabaseAdmin
              .from('playlist_history')
              .insert({
                playlist_id: playlistData.id,
                image_id: imageData.id,
              });
          }
        } catch (error) {
          console.error(`Error fetching covers for playlist ${playlist.id}:`, error);
        }
      }
    }
    console.log(`Finished processing playlists and images for user ${userId}`);
  } catch (error) {
    console.error('Error processing playlists and images:', error);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://127.0.0.1:3000/api/callback',
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Fetch Spotify user profile
    const spotifyProfile = await fetchSpotifyUserProfile(access_token);
    
    console.log("Spotify profile fetched:", spotifyProfile.id);

    // First, check if user already exists by spotify_id
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('spotify_id', spotifyProfile.id)
      .single();
    
    // User ID - either existing or new
    const userId = existingUser?.id || uuidv4();
    
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
      return NextResponse.redirect(new URL(`/dashboard?access_token=${access_token}&db_error=user_insert`, request.url));
    }

    console.log("User saved successfully, redirecting to dashboard");
    
    // Process playlists and images in the background
    // We don't await this so we can redirect the user immediately
    processPlaylistsAndImages(access_token, userData.id, spotifyProfile.id);

    // Redirect to dashboard immediately with access token
    // The background process will continue running
    return NextResponse.redirect(new URL(`/dashboard?access_token=${access_token}&sync=inprogress`, request.url));
  } catch (error) {
    console.error('Error during Spotify authentication flow:', error);
    return NextResponse.redirect(new URL('/?error=authentication_failed', request.url));
  }
}