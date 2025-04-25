import "server-only";

import { StackServerApp } from "@stackframe/stack";
import { SPOTIFY_SCOPES } from '@/lib/spotify-scope';

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    afterSignIn: "/user/dashboard",
    afterSignUp: "/user/dashboard",
    afterSignOut: "/",
  },
  oauthScopesOnSignIn: {
    spotify: SPOTIFY_SCOPES
  }
});
