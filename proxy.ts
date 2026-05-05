import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("WTBkR2VWbFhNVFk9")?.value;

  const pathname = request.nextUrl.pathname;

  const isLoginPage =
    pathname === "/" || pathname === "/users";

  // ✅ Allow login page
  if (isLoginPage) return NextResponse.next();

  // ✅ No token → redirect
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { role: string };

    // ✅ Admin-only pages
    if (pathname.startsWith("/admin") && decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // ✅ Example: Only admin + manager
    if (
      pathname.startsWith("/terminal-nodes") &&
      !["superadmin"].includes(decoded.role)
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};