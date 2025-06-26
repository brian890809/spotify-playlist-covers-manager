/**
 * Image URL utility to prioritize S3 URLs over Spotify URLs with fallback logic
 */

interface ImageData {
  s3_url?: string | null;
  url?: string | null;
}

export const getImageUrl = (image: ImageData, fallbackUrl = '/placeholder.jpg'): string => {
  // Early return for null/undefined image
  if (!image) return fallbackUrl;
  
  // Prioritize S3 URL, fallback to Spotify URL, then to placeholder
  return image.s3_url || image.url || fallbackUrl;
};

export const getImageUrls = (images: ImageData[]): string[] => {
  return images.map(image => getImageUrl(image));
};
