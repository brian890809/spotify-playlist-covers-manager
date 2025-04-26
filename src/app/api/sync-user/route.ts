import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { stackServerApp } from '@/stack';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {currentUser} = body;
        
        // Get authenticated user from Stack Auth
        const user = await stackServerApp.getUser({ or: 'redirect' });
        // Get Spotify access token from the authenticated user
        const account = await user.getConnectedAccount('spotify', { or: 'redirect' });
        const { accessToken } = await account.getAccessToken();

        // Check if user exists and is an object (not an empty string)
        if (!user || typeof user === 'string') {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        
        if (!accessToken) {
            return NextResponse.json({ error: 'No Spotify access token available' }, { status: 400 });
        }

        // Check if user already exists by spotify_id
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('spotify_id', currentUser.id)
            .single();
        
        // User ID - either existing or new
        const userId = existingUser?.id || uuidv4();
    
        // Insert or update user in the Supabase users table
        const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .upsert({
            id: userId,
            spotify_id: currentUser.id,
            display_name: currentUser.display_name,
            email: currentUser.email,
        })
        .select()
        .single();
        
        if (userError) {
            console.error('Error upserting user:', userError);
            return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 });
        }
        console.log("User data synced:", userData);
        return NextResponse.json({ message: 'User data synced successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error in sync-user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
