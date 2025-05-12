export const generateSpotifyPrompt = (playlistName: string, description: string) => {
    return `A 1:1 aspect ratio digital illustration designed as a Spotify playlist cover titled '${playlistName}'. The artwork visually represents: ${description}. Emphasize mood, energy, and vibe through composition, lighting, and color. Bold, eye-catching, and expressive design suitable for a music streaming app.`;
};

export const generateSpotifyPromptWithoutPlaylistName = (description: string) => {
  return `A 1:1 aspect ratio digital illustration designed as a Spotify playlist cover. The artwork visually represents: ${description}. Emphasize mood, energy, and vibe through composition, lighting, and color. Bold, eye-catching, and expressive design suitable for a music streaming app.`;
}

export const addKeywordsToPrompt = (prompt: string, keywords: string[]) => {
    prompt += ` Style keywords: ${keywords.join(', ')}`;
    return prompt;
}