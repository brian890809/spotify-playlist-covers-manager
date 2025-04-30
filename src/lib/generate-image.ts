export async function onGenerateImage(prompt: string, playlistId: string, userId: string, key: string) {
    try {
        const response = await fetch(`/api/generate-photos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                playlistId,
                userId,
                key
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`Failed to generate image: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data.imageUrl;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}