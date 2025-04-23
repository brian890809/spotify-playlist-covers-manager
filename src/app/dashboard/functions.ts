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
 * Uploads a playlist cover image to Spotify and updates Supabase using the API
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
  
  // 2. Call our API endpoint
  const response = await fetch('/api/upload-cover', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accessToken,
      playlistId,
      base64Image,
      userId
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(`Failed to upload image: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
  }
  
  const data = await response.json();
  return data.imageUrl;
};