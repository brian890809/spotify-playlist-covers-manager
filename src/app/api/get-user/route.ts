import {NextRequest, NextResponse} from 'next/server';
import axios from 'axios';
import { stackServerApp } from '@/stack';

export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser(); // Remove { or: 'redirect' }
        const userUrl = user.profileImageUrl
        const account = await user.getConnectedAccount('spotify', { or: 'redirect' });
        const { accessToken } = await account.getAccessToken();
        console.log('Access Token:', accessToken);
        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return NextResponse.json({...userResponse.data, profileUrl: userUrl});
    } catch (error) {
        console.error(error);
        // If unauthenticated, return 401
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}