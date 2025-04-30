import { Playlist, SpotifyUser } from '@/app/user/layout';

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
 * @param playlistId - Spotify playlist ID
 * @param file - Image file to upload
 * @param userId - Supabase user ID
 * @returns The URL of the uploaded image
 */
export const uploadPlaylistCover = async (
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

interface SelectedImage {
   url: string; 
   alt: string; 
   name: string;
  ownerId: string 
}


export const onImageUpload = async (file: File, currentUser: SpotifyUser | null, playlists: Playlist[], selectedImage: SelectedImage
, setSelectedImage: React.Dispatch<React.SetStateAction<SelectedImage | null>>, setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>
) => {
  if (!currentUser) return;

  try {
      const playlistId = playlists.find(p => p.name === selectedImage.name)?.id;
      if (!playlistId) {
          throw new Error('Playlist ID not found');
      }

      const imageUrl = await uploadPlaylistCover(
          playlistId,
          file,
          currentUser.id
      );

      // Update the UI with the new image
      setSelectedImage(prev => prev ? {
          ...prev,
          url: imageUrl
      } : null);

      // Update the playlist in the list
      setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId && p.images && p.images.length > 0) {
              return {
                  ...p,
                  images: [{
                      url: imageUrl,
                      height: p.images[0].height,
                      width: p.images[0].width
                  }, ...p.images.slice(1)]
              };
          }
          return p;
      }));
  } catch (error) {
      console.error('Error uploading playlist cover:', error);
      alert('Failed to upload image. Please try again.');
  }
}