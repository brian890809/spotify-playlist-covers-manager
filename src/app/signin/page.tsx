'use client';

import { OAuthButton } from "@stackframe/stack";
import Image from "next/image";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useSearchParams } from "next/navigation";

export default function CustomSignInPage() {
    // Get any redirect error information
    const searchParams = useSearchParams();
    const redirectError = searchParams.get("error");
    
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-[#121212] text-gray-900 dark:text-white">
            {/* Header with theme switcher */}
            <header className="w-full p-4 flex justify-end">
                <ThemeSwitcher />
            </header>
            
            <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-md p-8 bg-gray-100 dark:bg-[#181818] rounded-lg shadow-lg">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/icon.jpeg" 
                            alt="Logo"
                            width={80}
                            height={80}
                            className="rounded-full"
                            priority
                        />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-center mb-2">
                        Sign in to Spotify Playlist Covers
                    </h1>
                    
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                        Connect with your Spotify account to manage your playlist covers
                    </p>
                    
                    {redirectError && (
                        <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative mb-6">
                            <p>There was an error signing you in. Please try again.</p>
                        </div>
                    )}
                    
                    <div className="flex justify-center">
                        <div className="w-full relative">
                            {/* Custom styled button */}
                            <div className="flex items-center justify-center bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold py-3 px-4 rounded-full w-full">
                                <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2Z" fill="#191414"/>
                                    <path d="M16.7548 15.4118C16.5201 15.7647 16.0507 15.8824 15.6986 15.6471C13.3137 14.1765 10.3456 13.8824 6.63359 14.7059C6.22283 14.8235 5.75342 14.5294 5.63684 14.1176C5.52026 13.7059 5.81262 13.2353 6.2234 13.1176C10.2891 12.1765 13.6658 12.5294 16.402 14.1765C16.7548 14.4118 16.8713 14.9412 16.7548 15.4118ZM17.9918 12.4118C17.7571 12.8235 17.1713 12.9412 16.8184 12.7059C14.0822 11 10.1109 10.4118 6.40991 11.4118C5.9405 11.5294 5.52974 11.2353 5.35447 10.7647C5.23789 10.2941 5.52026 9.88235 5.98967 9.76471C10.2291 8.70588 14.6679 9.29412 17.8752 11.2353C18.228 11.4706 18.3446 12.0588 17.9918 12.4118ZM18.1163 9.52941C14.8426 7.58824 9.03075 7.41176 5.8728 8.29412C5.28701 8.47059 4.70122 8.11764 4.52596 7.47059C4.35068 6.82353 4.70122 6.23529 5.34569 6.05882C9.03075 5.05882 15.4048 5.17647 19.2821 7.47059C19.8678 7.76471 20.0431 8.47059 19.7503 9.05882C19.4574 9.58824 18.7019 9.82353 18.1163 9.52941Z" fill="white"/>
                                </svg>
                                <span>Continue with Spotify</span>
                            </div>
                            
                            {/* Actual OAuth button positioned over our custom button */}
                            <div className="absolute inset-0 opacity-0">
                                <OAuthButton 
                                    provider="spotify" 
                                    type="sign-in"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                        By continuing, you agree to allow Spotify Playlist Covers to access your Spotify account data in accordance with our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
            
            <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Spotify Playlist Covers. All rights reserved.
            </footer>
        </div>
    );
}
