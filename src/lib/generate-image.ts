export async function generateImage(prompt: string, playlistId: string, userId: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-photos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                playlistId,
                userId
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