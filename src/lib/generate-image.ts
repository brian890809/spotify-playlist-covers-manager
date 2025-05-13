'use server'

import { GoogleGenAI } from "@google/genai";
import {generateSpotifyPrompt, generateSpotifyPromptWithoutPlaylistName, addKeywordsToPrompt} from "@/prompts/generate-album-cover";
import compressImageBuffer from "@/lib/compress-image";

const sanitizeBase64 = (base64: string) => {
    // Remove any data URL prefix (like "data:image/png;base64,") if present
    return base64.replace(/^data:image\/\w+;base64,/, '');
};

const imageToKb = (base64: string) => Math.ceil((base64.length * 6) / 8 / 1000 );
const maxImageSize = 256; // 256 KB

export async function onGenerateImage(prompt: string, playlistName:string, keywords:string[]) {
    const apiKey = process.env.DEFAULT_GEMINI_API_KEY;
    try {
        // Initialize the Google AI with the provided API key
        const genAI = new GoogleGenAI({apiKey});
        let genAiPrompt = playlistName !== "" 
            ? generateSpotifyPrompt(playlistName, prompt) 
            : generateSpotifyPromptWithoutPlaylistName(prompt);


        if (keywords.length > 0) {
            genAiPrompt = addKeywordsToPrompt(genAiPrompt, keywords);
        }

        // Get the Generative Model for image generation
        const response = await genAI.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: genAiPrompt,
            config: { numberOfImages: 1 },
          });
        
        // Process the response to get the image data
        if (!response.generatedImages?.[0]?.image?.imageBytes) {
            throw new Error('No image generated');
        }
        const imageBytes = response.generatedImages[0].image.imageBytes;
        const sanitizedImageBytes = sanitizeBase64(imageBytes);
        
        // Check the size of the image
        const imageSizeKb = imageToKb(sanitizedImageBytes);
        const imageBuffer = Buffer.from(imageBytes, 'base64');
        if (imageSizeKb > maxImageSize) {
            // compress image
            const compressedBuffer = await compressImageBuffer(imageBuffer);
            return {
                imageBytes: compressedBuffer.toString('base64'),
            };
        }
        
        // Return the sanitized image bytes instead of saving it
        return {
            imageBytes: sanitizedImageBytes,
        };
    } catch (error) {
        console.error('Error generating image with Gemini:', error);
        throw error;
    }
}
