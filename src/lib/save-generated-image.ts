'use client';

export default async function saveGeneratedImage(imageBytes: string, playlistId: string, userId: string) {
    try {
        const response = await fetch('/api/upload-cover', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playlistId,
                base64Image: imageBytes,
                userId,
                type: 'ai',
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to save generated image: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving generated image:', error);
        throw error;
    }
}