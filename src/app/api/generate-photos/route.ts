import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt, playlistId, userId } = await request.json();
    if (!prompt || !playlistId || !userId) {
      return NextResponse.json(
        { error: `No prompt, playlist ID or user ID provided` },
        { status: 401 }
      );
    }

  } catch (error: any) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: `Failed to process request: ${error.message}` },
      { status: 500 }
    );
  }
}