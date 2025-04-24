import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { getSpotifyImageId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, playlistId, base64Image, userId } = await request.json();

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
    const spotify_image_id = getSpotifyImageId(imageUrl);

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL found after upload' },
        { status: 500 }
      );
    }

    // 3. Get playlist and user from Supabase
    const { data: playlistData, error: playlistError } = await supabaseAdmin
      .from('playlists')
      .select('id')
      .eq('spotify_id', playlistId)
      .single();
      if (playlistError || !playlistData) {
        console.error('Supabase error at getting playlist:', playlistError);
        return NextResponse.json(
          { error: `Failed to get playlist from Supabase: ${playlistError?.message || 'Playlist not found'}` },
          { status: 500 }
        );
      }

      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('spotify_id', userId)
        .single();
      if (userError || !userData) {
        console.error('Supabase error at getting user:', userError);
        return NextResponse.json(
          { error: `Failed to get user from Supabase: ${userError?.message || 'User not found'}` },
          { status: 500 }
        );
      }

    // 4. Insert the new image into Supabase
    const imageId = uuidv4();
    const { data: imageData, error: imageError } = await supabaseAdmin
      .from('images')
      .insert({
        id: imageId,
        user_id: userData.id,
        playlist_id: playlistData.id,
        url: imageUrl,
        spotify_image_id: spotify_image_id,
        type: 'upload',
        changed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (imageError || !imageData) {
      console.error('Supabase error at inserting image:', imageError);
      return NextResponse.json(
        { error: `Failed to insert image into Supabase: ${imageError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // 5. Update the playlist's current_cover
    const { error: updateError } = await supabaseAdmin
      .from('playlists')
      .update({ current_cover: imageId })
      .eq('id', playlistData.id);

    if (updateError) {
      console.error('Supabase error at updating current_cover:', updateError);
      return NextResponse.json(
        { error: `Failed to update playlist current_cover: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Return success response with the new image URL
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}