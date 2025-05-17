import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';

// api key metadata:
/**
 * user metadata:
 * {
 *  // ... other user metadata
 *  "apiKeys": [
 *    {"id": "unique-id", "llmType": "openai", "apiKey": "sk-1234567890"},
 *    {"id": "unique-id-2", "llmType": "perplexity", "apiKey": "sk-0987654321"},
 *    {"id": "unique-id-3", "llmType": "claude", "apiKey": "sk-1122334455"},
 *    {"id": "unique-id-4", "llmType": "gemini", "apiKey": "sk-5566778899"},
 *  ]
 * }
 */

export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
        }

        // Assuming your API keys are stored directly in serverMetadata or a nested object like serverMetadata.apiKeys
        const apiKeys = user.serverMetadata?.apiKeys || []; // Or user.serverMetadata?.apiKeys if nested
        return NextResponse.json(apiKeys, { status: 200 });
    } catch (error) {
        console.error('Error fetching API key metadata:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
        }
        
        const serverMetadata = user.serverMetadata || {};
        // Assuming you want to update the entire serverMetadata or a specific key within it
        // For example, to store the body under an 'apiKeys' key in serverMetadata:
        await user.update({
            serverMetadata: {
                ...serverMetadata, // Preserve existing metadata if needed
                apiKeys: body, // Or directly body if you want to replace all serverMetadata
            },
        });

        // Stack Auth's user.update doesn't return the updated user object directly in the same way a fetch POST might.
        // It's common to return a success message or the data that was intended to be saved.
        return NextResponse.json({ message: 'API keys posted successfully', data: body }, { status: 200 });

    } catch (error) {
        console.error('Error posting API keys:', error);
        if (error instanceof SyntaxError) {
                return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}