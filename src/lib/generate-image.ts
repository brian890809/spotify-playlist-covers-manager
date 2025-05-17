import {generateSpotifyPrompt, generateSpotifyPromptWithoutPlaylistName, addKeywordsToPrompt} from "@/prompts/generate-album-cover";
import processImage from "./initialize-process-image";

export async function onGenerateImage(prompt: string, playlistName:string, keywords:string[], model:string) {
    try {
        // Initialize the Google AI with the provided API key
        let genAiPrompt = playlistName !== "" 
            ? generateSpotifyPrompt(playlistName, prompt) 
            : generateSpotifyPromptWithoutPlaylistName(prompt);

        if (keywords.length > 0) {
            genAiPrompt = addKeywordsToPrompt(genAiPrompt, keywords);
        }
        
        const imageBytes = await processImage(model, genAiPrompt);
        
        // Return the sanitized image bytes instead of saving it
        return imageBytes;
    } catch (error) {
        console.error('Error generating image with Gemini:', error);
        throw error;
    }
}
