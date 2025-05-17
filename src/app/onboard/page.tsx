'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import completeOnboarding from "@/utils/completeOnboard";

export default function OnboardPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleOnboard = async () => {
        setIsLoading(true);
        try {
            await completeOnboarding();
            // Redirect to dashboard after successful onboarding
            router.push('/user/dashboard');
        } catch (error) {
            console.error("Error during onboarding:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/icon.jpeg"
                            alt="Logo"
                            width={80}
                            height={80}
                            className="rounded-full"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                        Welcome to Spotify Playlist Covers
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        Get started by customizing your playlist covers with AI-generated images.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md text-sm">
                        <h3 className="font-medium mb-2">What you'll get:</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>AI-generated cover images for your playlists</li>
                            <li>Seamless integration with your Spotify account</li>
                            <li>Easy management of your playlist covers</li>
                        </ul>
                    </div>

                    <Button
                        onClick={handleOnboard}
                        className="w-full"
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? "Setting up your account..." : "Get Started"}
                    </Button>
                </div>
            </div>
        </div>
    );
}