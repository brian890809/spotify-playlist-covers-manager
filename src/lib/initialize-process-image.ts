'use server'
import { GoogleGenAI } from "@google/genai";
import compressImageBuffer from "@/lib/compress-image";
import { stackServerApp } from "@/stack";
import OpenAI from "openai";

const sanitizeBase64 = (base64: string) => {
    // Remove any data URL prefix (like "data:image/png;base64,") if present
    return base64.replace(/^data:image\/\w+;base64,/, '');
};

const imageToKb = (base64: string) => Math.ceil((base64.length * 6) / 8 / 1000 );
const maxImageSize = 256; // 256 KB

const processImage = async (model:string, prompt:string) => {
    let response: any;
    let imageBytes: string = '';
    if (model === '__default') {
        const apiKey = process.env.DEFAULT_GEMINI_API_KEY;
        const genAI = new GoogleGenAI({apiKey});
        response = await genAI.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt,
            config: { numberOfImages: 1 },
        });
        imageBytes = response.generatedImages[0].image.imageBytes;
    } else {
        const user = await stackServerApp.getUser({ or: 'redirect' });
        const serverMetadata = user.serverMetadata || {};
        switch (model) {
            case 'openai':
                const key = serverMetadata.apiKeys.find((key: any) => key.llmType === 'openai')?.apiKey;
                if (!key) {
                    throw new Error('OpenAI API key not found');
                }
                const openai = new OpenAI();
                response = await openai.images.generate({
                    model: "gpt-image-1",
                    prompt,
                });
                imageBytes = response.data[0].b64_json;
                break;
        }
    }
            
    // Process the response to get the image data
    if (imageBytes === '') {
        throw new Error('No image generated');
    }
    // Check the size of the image
    const imageSizeKb = imageToKb(imageBytes);
    const imageBuffer = Buffer.from(imageBytes, 'base64');

    // compress image
    if (imageSizeKb > maxImageSize) {
        const compressedBuffer = await compressImageBuffer(imageBuffer);
        return {
            imageBytes: compressedBuffer.toString('base64'),
        };
    }
    
    // Return the sanitized image bytes instead of saving it
    return {
        imageBytes,
    };
}

export default processImage;