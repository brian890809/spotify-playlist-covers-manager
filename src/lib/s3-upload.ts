'use server';

import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from './s3-client';

const BUCKET_NAME = 'playlist-covers';

interface UploadResult {
  s3Url: string;
  s3Key: string;
}

export const uploadToS3 = async (
  imageBuffer: Buffer,
  userId: string,
  playlistId: string,
  type: 'ai' | 'upload' | 'diy'
): Promise<UploadResult> => {
  const s3Client = createS3Client();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const s3Key = `${userId}/${playlistId}/${timestamp}_${type}.jpg`;
  
  const putCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
  });

  await s3Client.send(putCommand);
  
  const s3Url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${s3Key}`;
  
  return { s3Url, s3Key };
};

export const getImageFromS3 = async (s3Key: string): Promise<Buffer> => {
  const s3Client = createS3Client();
  
  const getCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  const response = await s3Client.send(getCommand);
  const chunks: Uint8Array[] = [];
  
  if (response.Body) {
    // Handle the stream
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
  }
  
  return Buffer.concat(chunks);
};
