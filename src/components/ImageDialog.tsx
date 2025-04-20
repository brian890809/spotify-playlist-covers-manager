'use client'

import { useRef, useEffect } from 'react';
import Image from 'next/image';

interface ImageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    altText: string;
}

export default function ImageDialog({ isOpen, onClose, imageUrl, altText }: ImageDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Handle ESC key press to close the dialog
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent scrolling of the body when dialog is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Handle click outside to close dialog
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
        >
            <div
                ref={dialogRef}
                className="bg-white dark:bg-gray-800 rounded-lg p-2 max-w-[90vw] max-h-[90vh] relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Close dialog"
                >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                    </svg>
                </button>

                <div className="relative overflow-hidden">
                    <div className="relative w-full" style={{ maxWidth: '80vw', maxHeight: '80vh' }}>
                        <Image
                            src={imageUrl}
                            alt={altText}
                            className="object-contain"
                            width={500}
                            height={500}
                            sizes="(max-width: 768px) 90vw, 70vw"
                            style={{
                                width: 'auto',
                                height: 'auto',
                                maxWidth: '80vw',
                                maxHeight: '80vh'
                            }}
                        />
                    </div>
                    <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
                        {altText}
                    </div>
                </div>
            </div>
        </div>
    );
}