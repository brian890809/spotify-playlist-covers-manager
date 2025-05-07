import { supabaseAdmin } from '@/lib/supabase';
import { getSpotifyImageId } from '@/lib/utils';
import { stackServerApp } from '@/stack';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const user = await stackServerApp.getUser({ or: 'redirect' });
        const account = await user.getConnectedAccount('spotify', { or: 'redirect' });
        const { accessToken } = await account.getAccessToken();
        const { imgUrl, playlistId, userId } = await req.json();
        const spotify_image_id = getSpotifyImageId(imgUrl);

        if (!accessToken || !playlistId || !userId) {
            return NextResponse.json(
              { error: 'Missing required fields' },
              { status: 400 }
            );
        }

        const response = await fetch(imgUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
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
        const imageUrl = images[0]?.url; // new image URL
        const newImageId = getSpotifyImageId(imageUrl);

        if (!imageUrl) {
            return NextResponse.json(
            { error: 'No image URL found after upload' },
            { status: 500 }
            );
        }
    
        // 3. Get playlist from Supabase
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
    
        // 4. Update the existing image in Supabase
        const { data: existingImage, error: existingImageError } = await supabaseAdmin
            .from('images')
            .select('id')
            .eq('spotify_image_id', spotify_image_id)
            .single();
        
        if (existingImageError) {
            console.error('Supabase error at getting existing image:', existingImageError);
            return NextResponse.json(
            { error: `Failed to get existing image from Supabase: ${existingImageError?.message || 'Image not found'}` },
            { status: 500 }
            );
        }
        
        const { error: updateImageError } = await supabaseAdmin
            .from('images')
            .update({
            url: imageUrl,
            changed_at: new Date().toISOString(),
            spotify_image_id: newImageId,
            })
            .eq('id', existingImage.id);
            
        if (updateImageError) {
            console.error('Supabase error at updating image:', updateImageError);
            return NextResponse.json(
            { error: `Failed to update image in Supabase: ${updateImageError?.message || 'Unknown error'}` },
            { status: 500 }
            );
        }
        
        // Update the playlist's current_cover
        const { error: updateError } = await supabaseAdmin
        .from('playlists')
        .update({ current_cover: existingImage.id })
        .eq('id', playlistData.id);

        if (updateError) {
            console.error('Supabase error at updating playlist current image:', updateError);
            return NextResponse.json(
            { error: `Failed to update image in Supabase: ${updateError?.message || 'Unknown error'}` },
            { status: 500 }
            );
        }
    
      // Return success response with the new image URL
      return NextResponse.json({ message: 'Image updated successfully' }, { status: 200  });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to handle image click' }, { status: 500 });
    }
}