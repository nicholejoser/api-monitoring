import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  console.log("🔥 PROXY RUNNING:", request.nextUrl.pathname);

  const token = request.cookies.get("WTBkR2VWbFhNVFk9")?.value;

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoute) { 
    if (!token) {
      console.log("❌ No token");
      return NextResponse.redirect(new URL("/", request.url));
    }

    const verified = verifyToken(token);

    if (!verified) {
      console.log("❌ Invalid token");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};