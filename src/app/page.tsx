import Image from "next/image";
import LoginButton from "@/components/LoginButton";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-4xl font-bold mb-4">Spotify Playlist Viewer</h1>
        <p className="text-xl mb-8">View your Spotify playlists in a clean tabular format</p>
        <LoginButton />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-500">
        <p>A simple app to view your Spotify playlists</p>
      </footer>
    </div>
  );
}
