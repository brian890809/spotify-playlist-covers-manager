# S3 Integration Documentation

## Overview
This document outlines the S3 integration implemented for the Spotify Playlist Covers application. The integration provides backup storage for all user-generated images using Supabase's S3-compatible storage.

## Architecture

### Current Flow
1. **User uploads/generates image** → Convert to buffer
2. **Save to Supabase S3** → Get S3 URL and key  
3. **Upload to Spotify** → (existing flow) Get Spotify URL
4. **Save both URLs** → Store in database with preference for S3
5. **Serve from S3** → Use S3 URL in frontend with fallback to Spotify

### Files Modified/Created

#### New Files
- `src/lib/s3-client.ts` - S3 client configuration
- `src/lib/s3-upload.ts` - S3 upload utilities
- `src/lib/image-url.ts` - Image URL helper functions
- `src/app/api/migrate-images/route.ts` - Migration endpoint
- `src/app/api/migrate-schema/route.ts` - Schema migration endpoint

#### Modified Files
- `src/app/api/upload-cover/route.ts` - Added S3 upload before Spotify
- `src/app/api/update-cover/route.ts` - Added S3 backup for updated images
- `src/app/api/sync-playlist/route.ts` - Added S3 backup for existing Spotify images
- `src/app/api/get-recent-images/route.ts` - Prioritize S3 URLs in responses

## Environment Variables

Add these to your `.env.local`:

```bash
SUPABASE_S3_ACCESS_KEY_ID=your_access_key_id
SUPABASE_S3_SECRET_ACCESS_KEY=your_secret_access_key
SUPABASE_REGION=your_project_region
SUPABASE_S3_ENDPOINT=your_s3_endpoint_url
```

## Database Schema Changes

**IMPORTANT**: Run this SQL manually in your Supabase database:

```sql
ALTER TABLE public.images 
ADD COLUMN s3_url text,
ADD COLUMN s3_key text;

CREATE INDEX idx_images_s3_key ON public.images(s3_key);
```

## Usage

### Image URL Helper Functions

```typescript
import { getImageUrl } from '@/lib/image-url';

// Automatically prioritizes S3 URL over Spotify URL
const imageUrl = getImageUrl(imageData);

// With custom fallback
const imageUrl = getImageUrl(imageData, '/custom-placeholder.jpg');
```

### API Endpoints

#### Upload New Image
```bash
POST /api/upload-cover
# Now automatically saves to S3 and returns S3 URL
```

#### Migrate Existing Images
```bash
POST /api/migrate-images
# Processes 50 images at a time, downloads from Spotify and uploads to S3
```

#### Test Schema Migration
```bash
POST /api/migrate-schema
# Tests database connectivity (actual schema changes must be done manually)
```

## Migration Process

1. **Setup Environment Variables**
   - Add S3 credentials to `.env.local`

2. **Update Database Schema**
   - Run the SQL commands manually in Supabase dashboard

3. **Test New Uploads**
   - Upload a new image and verify it saves to S3

4. **Migrate Existing Images**
   - Call `/api/migrate-images` repeatedly until all images are migrated
   - Monitor the response for success/failure counts

5. **Verify Integration**
   - Check that images load from S3 URLs
   - Verify fallback to Spotify URLs works

## Storage Structure

Images are stored in the `playlist-covers` bucket with this path structure:
```
user_id/playlist_id/timestamp_type.jpg
```

Example:
```
uuid-1234/uuid-5678/2025-06-26T10-30-45-123Z_ai.jpg
```

## Error Handling

- **S3 Upload Fails**: Image still uploads to Spotify, logged as error
- **Spotify Upload Fails**: Returns error, S3 copy remains
- **Migration Fails**: Individual image errors are logged, process continues
- **Missing S3 URL**: Automatically falls back to Spotify URL

## Benefits

1. **Reliability**: Images persist even if Spotify changes CDN structure
2. **Performance**: Serve from Supabase's global CDN
3. **Control**: Full ownership of image assets
4. **Analytics**: Track image usage and access patterns
5. **Backup**: Preserve all user-generated content

## Monitoring

Check these logs for S3 operations:
- Upload success/failure rates
- Migration progress
- Storage usage
- Access patterns

## Troubleshooting

### Common Issues

1. **"column images.s3_url does not exist"**
   - Run the database schema SQL commands

2. **S3 upload fails with credentials error**
   - Verify environment variables are set correctly
   - Check S3 access keys in Supabase dashboard

3. **Images not loading from S3**
   - Verify bucket permissions are set to public read
   - Check the S3 URL format

4. **Migration endpoint timeout**
   - Process smaller batches by reducing the limit in the query
   - Run migration multiple times for large datasets

### Testing Commands

```bash
# Test S3 connectivity
curl -X POST http://localhost:3000/api/migrate-schema

# Test migration (without S3 columns, should error as expected)
curl -X POST http://localhost:3000/api/migrate-images

# After schema update, should work
curl -X POST http://localhost:3000/api/migrate-images
```

## Next Steps

1. Monitor storage costs and usage patterns
2. Implement automatic cleanup of old Spotify URLs after successful migration
3. Add retry logic for failed S3 uploads
4. Consider implementing image compression for S3 storage
5. Add metrics and monitoring dashboard
