import { S3Client } from '@aws-sdk/client-s3';

export const createS3Client = (): S3Client => {
  // Validate environment variables
  const region = process.env.SUPABASE_REGION;
  const endpoint = process.env.SUPABASE_S3_ENDPOINT;
  const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;

  if (!region || !endpoint || !accessKeyId || !secretAccessKey) {
    console.error('Missing S3 environment variables:', {
      hasRegion: !!region,
      hasEndpoint: !!endpoint,
      hasAccessKeyId: !!accessKeyId,
      hasSecretAccessKey: !!secretAccessKey
    });
    throw new Error('Missing required S3 environment variables');
  }

  console.log('Creating S3 client with config:', {
    region,
    endpoint: endpoint.substring(0, 20) + '...',
    accessKeyId: accessKeyId.substring(0, 8) + '...'
  });

  return new S3Client({
    forcePathStyle: true,
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    }
  });
};
