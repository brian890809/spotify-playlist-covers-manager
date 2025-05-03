'use server'

import { GoogleGenAI } from "@google/genai";
import generateSpotifyPrompt from "@/prompts/generate-album-cover";

export async function onGenerateImage(prompt: string, playlistName:string, playlistId: string, userId: string) {
    const apiKey = process.env.DEFAULT_GEMINI_API_KEY;
    console.log(apiKey)
    try {
        // Initialize the Google AI with the provided API key
        const genAI = new GoogleGenAI({apiKey});
        const genAiPrompt = generateSpotifyPrompt(playlistName, prompt);
        console.log("Generated Prompt: ", genAiPrompt);
        // Get the Generative Model for image generation
        const result = await genAI.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: genAiPrompt,
            config: { numberOfImages: 1 },
          });
        
        // Process the response to get the image data
        const response = result?.generatedImages?.[0]?.image;
        const imageBytes = response?.imageBytes;
        if (!imageBytes) {
            throw new Error('No image bytes found in the response');
        }
        
        // Store the generated image URL and metadata in your backend
        const imageData = await saveGeneratedImage(prompt, imageBytes, playlistId, userId);
        
        return imageData.imageUrl;
    } catch (error) {
        console.error('Error generating image with Gemini:', error);
        throw error;
    }
}

// Helper function to save the generated image data
async function saveGeneratedImage(prompt: string, imageBytes: string, playlistId: string, userId: string) {
    // Here we still use an API endpoint to save the image data to your backend/database
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