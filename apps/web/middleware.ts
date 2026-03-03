import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected: dashboard routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/(dashboard)")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // RFC 8058: Add List-Unsubscribe headers for unsubscribe endpoint
  const response = NextResponse.next();

  if (pathname.startsWith("/api/")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/v1/:path*",
    // Exclude static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
