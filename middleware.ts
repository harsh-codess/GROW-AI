// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { refreshSessionCookie, verifyJwtToken } from "@/lib/auth/auth";
// export { auth as middleware } from "@/auth";

export async function middleware(request: NextRequest) {
  // Paths that don't require authentication
  const publicPaths = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/api/auth/login",
    "/api/auth/register",
  ];

  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname === path ||
    request.nextUrl.pathname.startsWith("/api/auth/") ||
    request.nextUrl.pathname.startsWith("/_next/")
  );

  // Check if path is the static files
  if (
    request.nextUrl.pathname.includes("/_next/") ||
    request.nextUrl.pathname.includes("/api/auth/") ||
    request.nextUrl.pathname.includes("/favicon.ico") ||
    request.nextUrl.pathname.includes(".svg") ||
    request.nextUrl.pathname.includes(".png") ||
    request.nextUrl.pathname.includes(".jpg") ||
    request.nextUrl.pathname.includes(".jpeg") ||
    request.nextUrl.pathname.includes(".gif")
  ) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get("session");

  // Check if user is authenticated
  const isAuthenticated = sessionCookie ?
    !!(await verifyJwtToken(sessionCookie.value)) :
    false;

  // If the path requires authentication and user is not authenticated
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If the path doesn't require authentication and user is authenticated
  if (
    (request.nextUrl.pathname === "/auth/login" ||
     request.nextUrl.pathname === "/auth/register") &&
    isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Refresh session cookie if needed
  return await refreshSessionCookie(request);
}

export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes that don't start with /api/auth
    // - Static files
    // - favicon.ico
    "/((?!api/(?!auth)|_next/static|_next/image|favicon.ico).*)",
  ],
};
