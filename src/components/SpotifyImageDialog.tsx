'use client'

import Image from 'next/image'
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogTitle
} from '@/components/ui/dialog'
import { XIcon } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface SpotifyImageDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    imageUrl: string
    altText: string
    playlistName?: string
}

export default function SpotifyImageDialog({
    isOpen,
    onOpenChange,
    imageUrl,
    altText,
    playlistName
}: SpotifyImageDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#121212] border-[#333333] max-w-3xl w-[95vw] p-0 overflow-hidden rounded-xl shadow-2xl">
                <VisuallyHidden>
                    <DialogTitle>
                        null
                    </DialogTitle>
                </VisuallyHidden>
                <div className="relative flex flex-col items-center">
                    {/* Close button styled to match Spotify */}
                    <DialogClose className="absolute top-2 right-2 z-10 rounded-full bg-black/60 hover:bg-black/70 p-2 transition-colors">
                        <XIcon className="h-5 w-5 text-white" />
                        <span className="sr-only">Close</span>
                    </DialogClose>

                    {/* Image container */}
                    <div className="w-full overflow-hidden">
                        <div className="relative">
                            <Image
                                src={imageUrl}
                                alt={altText}
                                width={800}
                                height={800}
                                className="w-full h-auto object-contain"
                                priority
                            />
                        </div>

                        {/* Playlist name - Spotify style */}
                        {playlistName && (
                            <div className="p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 w-full">
                                <p className="text-white font-bold text-xl">{playlistName}</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}