'use server';

import { stackServerApp } from "@/stack";
import * as jose from "jose";

export const getSupabaseJwt = async () => {
  const user = await stackServerApp.getUser();

  if (!user) {
    return null;
  }

  const token = await new jose.SignJWT({
    sub: user.id,
    role: "authenticated",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET));

  return token;
};
