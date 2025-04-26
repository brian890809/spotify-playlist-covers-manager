import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { getSpotifyImageId } from '@/lib/utils';
import { stackServerApp } from '@/stack';

// Helper function to process playlists and images
async function processPlaylistsAndImages(playlists: any[], userId: string, spotifyId: string, accessToken: string) {
  try {
    // Filter for playlists owned by the user
    const ownedPlaylists = playlists.filter((playlist) => playlist.owner.id === spotifyId);
    console.log(`Only processing ${ownedPlaylists.length} playlists for user ${userId}`);
    
    // Process each playlist
    for (const playlist of ownedPlaylists) {
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
      
      // Process playlist cover images if available
      if (playlist.images && playlist.images.length > 0) {
        const coverUrl = playlist.images[0].url;
        
        // Check if cover already exists by spotify image id
        const imageId = getSpotifyImageId(coverUrl);
        const { data: existingImage, error } = await supabaseAdmin
          .from('images')
          .select('id, url')
          .eq('spotify_image_id', imageId);

        if (error) {
          console.error('Error upserting image:', error);
          continue;
        }
        const imageExists = existingImage && existingImage.length > 0;
        // If the image already exists, we only update the url if needed
        if (imageExists) {
          if (existingImage[0].url === coverUrl) {
            console.log(`Image already exists for ${playlist.name}, skipping upload`);
          } else {
            // Update the existing image URL
            console.log(`Playlist ${playlist.name} has a different CDN URL, updating`);
            await supabaseAdmin
              .from('images')
              .update({ url: coverUrl })
              .eq('id', existingImage[0].id);
          }
        } else {
          // Otherwise, we need to create a new image record
          console.log(`Creating new image record for ${playlist.name}`);
          const image_id = uuidv4();
          
          // Insert image into Supabase
          const { data: imageData, error: imageError } = await supabaseAdmin
            .from('images')
            .upsert({
              id: image_id,
              user_id: userId,
              playlist_id: playlistData.id,
              url: coverUrl,
              type: 'upload', // Existing Spotify covers are considered 'upload' type
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
      } else {
        // If no images are provided, we might want to fetch them via API
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
            const imageId = getSpotifyImageId(coverUrl);
            
            // Check if cover already exists
            const { data: existingImage } = await supabaseAdmin
              .from('images')
              .select('id, url')
              .eq('spotify_image_id', imageId)
              .single();
            
            // Handle existing image or create new one
            if (existingImage) {
              if (existingImage.url !== coverUrl) {
                await supabaseAdmin
                  .from('images')
                  .update({ url: coverUrl })
                  .eq('id', existingImage.id);
              }
            } else {
              const image_id = uuidv4();
              
              const { data: imageData, error: imageError } = await supabaseAdmin
                .from('images')
                .upsert({
                  id: image_id,
                  user_id: userId,
                  playlist_id: playlistData.id,
                  url: coverUrl,
                  type: 'upload',
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
          }
        } catch (error) {
          console.error(`Error fetching covers for playlist ${playlist.id}:`, error);
        }
      }
    }
    
    console.log(`Finished processing playlists and images for user ${userId}`);
    return { success: true, message: 'Playlists processed successfully' };
  } catch (error) {
    console.error('Error processing playlists and images:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    const { playlists, currentUser } = body;
    
    if (!playlists || !Array.isArray(playlists)) {
      return NextResponse.json({ error: 'Invalid playlist data' }, { status: 400 });
    }
    
    // Get authenticated user from Stack Auth
    const user = await stackServerApp.getUser({ or: 'redirect' });
    // Get Spotify access token from the authenticated user
    const account = await user.getConnectedAccount('spotify', { or: 'redirect' });
    const { accessToken } = await account.getAccessToken();
    
    // Check if user exists and is an object (not an empty string)
    if (!user || typeof user === 'string') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No Spotify access token available' }, { status: 400 });
    }

    // Check if user already exists by spotify_id
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('spotify_id', currentUser.id)
      .single();

    // User ID - either existing or new
    const userId = existingUser?.id || uuidv4();
    
    // Process the playlists
    const result = await processPlaylistsAndImages(playlists, userId, currentUser.id, accessToken);
    
    // Return success response
    return NextResponse.json({ 
      status: 'success',
      message: 'Playlists synchronized successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ 
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}