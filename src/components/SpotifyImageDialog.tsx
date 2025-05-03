'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogTitle
} from '@/components/ui/dialog'
import SelectModel from '@/components/SelectModel'
import { XIcon, Upload, RefreshCw } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { onGenerateImage } from '@/lib/generate-image'

interface SpotifyImageDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    imageUrl: string
    altText: string
    playlistName?: string
    canEdit?: boolean | null
    onImageUpload?: (file: File) => Promise<void>
    onGenerateWithAI?: (prompt: string) => Promise<void>
    accessToken?: string
    playlistId?: string
    userId?: string
}

const BlockGenAiUse = (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 transition-all duration-300 ease-in-out">
        <div className="bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white p-4 rounded-lg shadow-xl max-w-md w-4/5 text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out border border-gray-200 dark:border-[#444]">
            <p className="font-semibold text-lg mb-1">AI Generation Feature</p>
            <p>This feature is only available for premium users</p>
        </div>
    </div>
)

export default function SpotifyImageDialog({
    isOpen,
    onOpenChange,
    imageUrl,
    altText,
    playlistName,
    playlistId,
    canEdit = false,
    onImageUpload,
    userId
}: SpotifyImageDialogProps) {
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [recentImages, setRecentImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('default');
    const [displayedImage, setDisplayedImage] = useState(imageUrl);

    const [canUseGenAi, setCanUseGenAi] = useState<boolean>(true) // TODO: Assuming the user can use GenAI by default, will check with API later

    // Update displayedImage when imageUrl prop changes
    useEffect(() => {
        setDisplayedImage(imageUrl);
    }, [imageUrl]);

    // Load recent images from supabase 'images' table and update recentImages state
    useEffect(() => {
        const fetchRecentImages = async () => {
            try {
                const response = await fetch(`/api/get-recent-images?userId=${userId}&playlistId=${playlistId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch recent images');
                }
                const data = await response.json();
                setRecentImages(data.images);
            } catch (error) {
                console.error('Error fetching recent images:', error);
            }
        };

        fetchRecentImages();
    }, []); // Empty dependency array to run only once when the component mounts

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onImageUpload) {
            setIsUploading(true);
            try {
                await onImageUpload(file);
                // Add current image to recent images
                setRecentImages(prev => [imageUrl, ...prev.slice(0, 3)]);
            } catch (error) {
                console.error('Error uploading image:', error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleGenerateImage = async () => {
        if (aiPrompt && playlistId && userId) {
            setIsGenerating(true);
            try {
                // Call the Gemini-powered image generation function
                const generatedImageUrl = await onGenerateImage(aiPrompt, playlistName || "", playlistId, userId);

                // Update the displayed image
                // setDisplayedImage(generatedImageUrl);

                // Add current image to recent images after generation
                // setRecentImages(prev => [generatedImageUrl, ...prev.slice(0, 3)]);
                setAiPrompt('');
            } catch (error) {
                console.error('Error generating image:', error);
            } finally {
                setIsGenerating(false);
            }
        }
    };

    const handleImageClick = async (imgUrl: string) => {
        // Immediately update the displayed image for better UX
        setDisplayedImage(imgUrl);

        setIsUploading(true);
        try {
            const response = await fetch('/api/update-cover', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imgUrl, playlistId, userId }),
            });
            if (!response.ok) {
                setDisplayedImage(imageUrl);
                throw new Error('Failed to set playlist image');
                // If there's an error, revert to the original image
            }
        } catch (error) {
            console.error('Error updating cover:', error);
            // Revert to the original image on error
            setDisplayedImage(imageUrl);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white dark:bg-[#121212] border-gray-300 dark:border-[#333333] sm:max-w-7xl w-[98vw] p-0 overflow-hidden rounded-xl shadow-2xl transition-colors duration-300">
                <VisuallyHidden>
                    <DialogTitle>
                        Playlist Cover
                    </DialogTitle>
                </VisuallyHidden>

                {/* Main content with two columns */}
                <div className="flex flex-col md:flex-row">
                    {/* Left column - Current Cover */}
                    <div className="w-full md:w-2/5 p-6 flex flex-col">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Your Current Cover:</h3>

                        {/* Image container */}
                        <div className="relative flex-grow flex items-center justify-center bg-gray-100 dark:bg-[#1e1e1e] rounded-lg overflow-hidden">
                            <Image
                                src={displayedImage}
                                alt={altText}
                                width={400}
                                height={400}
                                className="w-full max-w-[400px] h-auto object-contain"
                                priority
                            />

                            {/* Playlist name overlay */}
                            {playlistName && (
                                <div className="p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 w-full">
                                    <p className="text-white font-bold text-xl">{playlistName}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column - Edit options */}
                    <div className={`w-full md:w-3/5 p-6 flex flex-col border-t md:border-t-0 md:border-l border-gray-300 dark:border-[#333333] ${!canEdit ? 'opacity-50 pointer-events-none' : ''}`}>

                        {/* Recent changes */}
                        <div className="mb-6">
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Your recent changes:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {recentImages.length > 0 ? (
                                    recentImages.map((img, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square bg-gray-100 dark:bg-[#1e1e1e] rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => handleImageClick(img)}
                                        >
                                            <Image
                                                src={img}
                                                alt={`Recent image ${index + 1}`}
                                                width={150}
                                                height={150}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    Array(4).fill(0).map((_, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square bg-gray-100 dark:bg-[#1e1e1e] rounded-md flex items-center justify-center"
                                        >
                                            <span className="text-gray-500 dark:text-[#777] text-xs">No history</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* AI Prompt */}
                        <div className="mb-6 relative group">
                            {!canUseGenAi && BlockGenAiUse}
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-2">Create a Cover with AI prompt:</h3>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    className="flex-grow p-3 rounded-md bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white border border-gray-300 dark:border-[#333] focus:border-[#1DB954] focus:outline-none transition-colors"
                                    placeholder="Describe the cover you want..."
                                    disabled={!canUseGenAi}
                                />
                                <button
                                    onClick={handleGenerateImage}
                                    disabled={!canUseGenAi || !aiPrompt}
                                    className={`flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2 px-5 rounded-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                >
                                    {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : 'Generate'}
                                </button>
                            </div>
                            {/* Model selector dropdown */}
                            {/* <div className="mt-1 flex items-end justify-end">
                                <SelectModel selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
                            </div> */}
                        </div>

                        {/* Upload */}
                        <div className="mt-auto">
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Upload New Cover:</h3>
                            <label className="flex items-center w-fit mx-auto gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2 px-4 rounded-full cursor-pointer transition-colors">
                                <Upload size={18} />
                                <span>Upload</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={!canEdit || isUploading}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Close button styled to match Spotify */}
                <DialogClose className="absolute top-4 right-4 z-10 rounded-full bg-gray-200/60 dark:bg-black/60 hover:bg-gray-200/80 dark:hover:bg-black/70 p-2 transition-colors">
                    <XIcon className="h-5 w-5 text-gray-700 dark:text-white" />
                    <span className="sr-only">Close</span>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}