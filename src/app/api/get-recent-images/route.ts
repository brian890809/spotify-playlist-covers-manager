import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// get playlist image history from supabase
export async function GET(request: NextRequest) {
  try {
    // Get user ID from request query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const playlistId = searchParams.get('playlistId')
    const limit = parseInt(searchParams.get('limit') || '4', 10);
    
    
    if (!userId || !playlistId) {
        // Error
        return NextResponse.json(
            { error: `No user ID or playlist ID provided` },
            { status: 401 }
        );
    }
    
    // get user_id
    const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('spotify_id', userId)
    .single();
    
    if (userError) {
        console.error('Error fetching user:', userError);
        return NextResponse.json(
            { error: `Failed to fetch user: ${userError.message}` },
            { status: 500 }
        );
    }

    // get playlist_id
    const { data: playListData, error: playlistError } = await supabaseAdmin
    .from('playlists')
    .select('id')
    .eq('spotify_id', playlistId)
    .single();


    if (playlistError) {
        if (playlistError.details === 'The result contains 0 rows') {
            return NextResponse.json({images: []})
        }
        // Handle actual database/query errors
        console.error('Error fetching playlist:', playlistError);
        return NextResponse.json(
            { error: `Failed to fetch playlist: ${playlistError.message}` },
            { status: 500 }
        );
    }


    // Playlist found, proceed...
    let query = supabaseAdmin
      .from('images')
      .select('url, changed_at')
      .eq('user_id', userData.id)
      .eq('playlist_id', playListData.id)
      .order('changed_at', { ascending: false })
      .limit(limit);
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching recent images:', error);
      return NextResponse.json(
        { error: `Failed to fetch recent images: ${error.message}` },
        { status: 500 }
      );
    }
    

    if (!data || data.length === 0) {
      return NextResponse.json({ images: [] });
    }
    
    // Extract just the image URLs from the data
    const images = data.map((item) => item.url);
    
    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Unexpected error fetching recent images:', error);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
