// const generateSpotifyPrompt = (playlistName: string, description: string, keywords: string) => {
//     return `A 1:1 aspect ratio digital illustration designed as a Spotify playlist cover titled '${playlistName}'. The artwork visually represents: ${description}. Style keywords: ${keywords}. Emphasize mood, energy, and vibe through composition, lighting, and color. Bold, eye-catching, and expressive design suitable for a music streaming app.`;
//   };

// include the keywords in the prompt in the future
const generateSpotifyPrompt = (playlistName: string, description: string) => {
    return `A 1:1 aspect ratio digital illustration designed as a Spotify playlist cover titled '${playlistName}'. The artwork visually represents: ${description}. Emphasize mood, energy, and vibe through composition, lighting, and color. Bold, eye-catching, and expressive design suitable for a music streaming app.`;
  };
export default generateSpotifyPrompt;