import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { getSpotifyImageId } from '@/lib/utils';
import { stackServerApp } from '@/stack';

// Helper function to handle background syncing with Supabase
async function syncWithSupabase(playlistId: string, userId: string, imageUrl: string, spotify_image_id: string, type: string, stackId: string) {
  try {
    // 3. Get playlist and user from Supabase
    const { data: playlistData, error: playlistError } = await supabase
      .from('playlists')
      .select('id')
      .eq('spotify_id', playlistId)
      .single();
    if (playlistError || !playlistData) {
      console.error('Supabase error at getting playlist:', playlistError);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('spotify_id', userId)
      .single();
    if (userError || !userData) {
      console.error('Supabase error at getting user:', userError);
      return;
    }

    // 4. Update the existing image in Supabase
    const { data: existingImage } = await supabase
      .from('images')
      .select('id')
      .eq('spotify_image_id', spotify_image_id)
      .single();
    
    if (existingImage) {
      const { error: updateImageError } = await supabase
        .from('images')
        .update({
          url: imageUrl,
          changed_at: new Date().toISOString(),
          stack_auth_user_id: stackId
        })
        .eq('id', existingImage.id);
      
      // Update the playlist's current_cover
      await supabase
        .from('playlists')
        .update({ 
          current_cover: existingImage.id,
          stack_auth_user_id: stackId
        })
        .eq('id', playlistData.id);
    
      if (updateImageError) {
        console.error('Supabase error at updating image:', updateImageError);
      }
    } else {
      // Insert the new image if it doesn't exist
      const imageId = uuidv4();
      const { data: imageData, error: imageError } = await supabase
        .from('images')
        .insert({
          id: imageId,
          user_id: userData.id,
          playlist_id: playlistData.id,
          url: imageUrl,
          spotify_image_id: spotify_image_id,
          stack_auth_user_id: stackId,
          type: type,
          changed_at: new Date().toISOString()
        })
        .select()
        .single();
    
      if (imageError || !imageData) {
        console.error('Supabase error at inserting image:', imageError);
        return;
      }
    
      // Update the playlist's current_cover
      const { error: updateError } = await supabase
        .from('playlists')
        .update({ current_cover: imageId, stack_auth_user_id: stackId })
        .eq('id', playlistData.id);
    
      if (updateError) {
        console.error('Supabase error at updating current_cover:', updateError);
      }
    }
    
    console.log('Background sync completed successfully');
  } catch (error) {
    console.error('Error in background sync:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ or: 'redirect' });
    const { id: stackId } = user;
    const account = await user.getConnectedAccount('spotify', { or: 'redirect' });
    const { accessToken } = await account.getAccessToken();

    const { playlistId, base64Image, userId, type = "upload" } = await request.json();

    if (!accessToken || !playlistId || !base64Image || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add debugging to check the base64Image format
    console.log('Base64 length:', base64Image.length);
    console.log('Base64 starts with:', base64Image.substring(0, 30));

    // 1. Upload image to Spotify - send raw base64 string directly
    const uploadResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'image/jpeg',
      },
      body: base64Image, // Send the raw base64 string, not a Buffer
    });

    // More detailed error logging
    if (!uploadResponse.ok) {
      let errorText;
      try {
        errorText = await uploadResponse.text();
        console.error('Spotify API error details:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText,
          headers: Object.fromEntries(uploadResponse.headers.entries())
        });
      } catch (e) {
        errorText = 'Could not parse error response';
        console.error('Failed to get error text:', e);
      }
      
      return NextResponse.json(
        { error: `Failed to upload image to Spotify: ${uploadResponse.status} - ${errorText}` },
        { status: uploadResponse.status }
      );
    }

    // 2. Fetch the new image URL from Spotify
    const imagesResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!imagesResponse.ok) {
      return NextResponse.json(
        { error: `Failed to get playlist images: ${imagesResponse.status}` },
        { status: imagesResponse.status }
      );
    }

    const images = await imagesResponse.json();
    const imageUrl = images[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL found after upload' },
        { status: 500 }
      );
    }

    const spotify_image_id = getSpotifyImageId(imageUrl);

    // Make sure spotify_image_id is not undefined before passing it to the background task
    if (spotify_image_id) {
      syncWithSupabase(playlistId, userId, imageUrl, spotify_image_id, type, stackId)
        .catch(error => console.error('Error in background sync process:', error));
      // Start the Supabase sync in the background without awaiting it
    } else {
      console.error('Unable to extract spotify_image_id from imageUrl');
    }

    // Return success response with the new image URL immediately
    return NextResponse.json({ imageUrl });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}