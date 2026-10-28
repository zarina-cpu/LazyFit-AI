import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const protectedPaths = ["/today", "/exercises", "/import", "/plan", "/chat", "/stats", "/profile"];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (isProtected && !request.auth) {
    const login = new URL("/login", request.nextUrl.origin);
    login.searchParams.set("from", pathname);
    return Response.redirect(login);
  }
  if (pathname === "/login" && request.auth) {
    return Response.redirect(new URL("/today", request.nextUrl.origin));
  }
  return undefined;
});

export const config = {
  matcher: [
    "/today/:path*",
    "/exercises/:path*",
    "/import/:path*",
    "/plan/:path*",
    "/chat/:path*",
    "/stats/:path*",
    "/profile/:path*",
    "/login",
  ],
};
