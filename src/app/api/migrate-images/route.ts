import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { uploadToS3 } from '@/lib/s3-upload';

export async function POST(): Promise<NextResponse> {
  try {
    // Get all images without S3 URLs in batches
    const { data: images, error } = await supabaseAdmin
      .from('images')
      .select('id, url, user_id, playlist_id, type, spotify_image_id')
      .is('s3_url', null)
      .not('url', 'is', null)

    if (error) {
      console.error('Error fetching images for migration:', error);
      return NextResponse.json(
        { error: `Failed to fetch images: ${error.message}` },
        { status: 500 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ 
        message: 'No images to migrate',
        processed: 0,
        total: 0
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const image of images) {
      try {
        console.log(`Migrating image ${image.id} from ${image.url}`);
        
        // Fetch image from Spotify CDN
        const response = await fetch(image.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        
        // Save to S3
        const { s3Url, s3Key } = await uploadToS3(
          imageBuffer, 
          image.user_id, 
          image.playlist_id || 'unknown', 
          image.type as 'ai' | 'upload' | 'diy'
        );
        
        // Update database with S3 info
        const { error: updateError } = await supabaseAdmin
          .from('images')
          .update({ s3_url: s3Url, s3_key: s3Key })
          .eq('id', image.id);
          
        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`);
        }
        
        successCount++;
        console.log(`Successfully migrated image ${image.id}`);
        
      } catch (imageError: any) {
        console.error(`Failed to migrate image ${image.id}:`, imageError);
        errors.push(`Image ${image.id}: ${imageError.message}`);
        errorCount++;
      }
    }
    
    return NextResponse.json({ 
      message: 'Migration batch completed',
      processed: images.length,
      successful: successCount,
      failed: errorCount,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error: any) {
    console.error('Migration batch error:', error);
    return NextResponse.json(
      { error: `Migration failed: ${error.message}` },
      { status: 500 }
    );
  }
}
