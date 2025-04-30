import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt, playlistId, userId, key: providedKey } = await request.json();
    if (!prompt || !playlistId || !userId) {
      return NextResponse.json(
        { error: `No prompt, playlist ID or user ID provided` },
        { status: 401 }
      );
    }
    const BYOK = !!providedKey; // bring your own key
    const key = !providedKey ? process.env.DEFAULT_KEY : providedKey;

    // default key
    if (!BYOK) { 

    }

  } catch (error: any) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: `Failed to process request: ${error.message}` },
      { status: 500 }
    );
  }
}