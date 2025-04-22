import { v4 as uuidv4 } from 'uuid';
import { createBrowserClient } from '@/lib/supabase';

/**
 * Converts an image file to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      base64String = base64String.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Uploads a playlist cover image to Spotify and updates Supabase
 * @param accessToken - Spotify access token
 * @param playlistId - Spotify playlist ID
 * @param file - Image file to upload
 * @param userId - Supabase user ID
 * @returns The URL of the uploaded image
 */
export const uploadPlaylistCover = async (
  accessToken: string,
  playlistId: string,
  file: File,
  userId: string
): Promise<string> => {
  // 1. Convert image to base64
  const base64Image = await fileToBase64(file);
  
  // 2. Upload image to Spotify
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'image/jpeg',
    },
    body: base64Image,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(`Failed to upload image to Spotify: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
  }
  
  // 3. Fetch the new image URL from Spotify
  const imagesResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!imagesResponse.ok) {
    throw new Error(`Failed to get playlist images: ${imagesResponse.status} ${imagesResponse.statusText}`);
  }
  
  const images = await imagesResponse.json();
  const imageUrl = images[0]?.url;
  
  if (!imageUrl) {
    throw new Error('No image URL found after upload');
  }
  
  // 4. Get playlist from Supabase
  const supabase = createBrowserClient();
  const { data: playlistData, error: playlistError } = await supabase
    .from('playlists')
    .select('id')
    .eq('spotify_id', playlistId)
    .single();
    
  if (playlistError || !playlistData) {
    throw new Error(`Failed to get playlist from Supabase: ${playlistError?.message || 'Playlist not found'}`);
  }
  
  // 5. Insert the new image into Supabase
  const imageId = uuidv4();
  const { data: imageData, error: imageError } = await supabase
    .from('images')
    .insert({
      id: imageId,
      user_id: userId,
      playlist_id: playlistData.id,
      url: imageUrl,
      type: 'upload',
      changed_at: new Date().toISOString() // Use the new column we added
    })
    .select()
    .single();
    
  if (imageError || !imageData) {
    throw new Error(`Failed to insert image into Supabase: ${imageError?.message || 'Unknown error'}`);
  }
  
  // 6. Update the playlist's current_cover
  const { error: updateError } = await supabase
    .from('playlists')
    .update({ current_cover: imageId })
    .eq('id', playlistData.id);
    
  if (updateError) {
    throw new Error(`Failed to update playlist current_cover: ${updateError.message}`);
  }
  
  return imageUrl;
};