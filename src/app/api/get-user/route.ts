import {NextRequest, NextResponse} from 'next/server';
import axios from 'axios';
import { stackServerApp } from '@/stack';

export async function GET(request: NextRequest) {
    try {
        // Try to get the user without redirecting
        const user = await stackServerApp.getUser({ or: 'return-null' });
        
        // If no user is found, return a 401 Unauthorized response
        if (!user) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            );
        }
        
        const userUrl = user.profileImageUrl
        
        try {
            const account = await user.getConnectedAccount('spotify', { or: 'return-null' });
            
            // If no Spotify account is connected, return a 401 with specific message
            if (!account) {
                return NextResponse.json(
                    { error: 'Spotify account not connected' },
                    { status: 401 }
                );
            }
            
            const { accessToken } = await account.getAccessToken();
            
            const userResponse = await axios.get('https://api.spotify.com/v1/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            
            return NextResponse.json({...userResponse.data, profileUrl: userUrl});
        } catch (spotifyError) {
            console.error('Spotify API error:', spotifyError);
            return NextResponse.json(
                { error: 'Error accessing Spotify account' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json(
            { error: 'Authentication error' },
            { status: 500 }
        );
    }
}