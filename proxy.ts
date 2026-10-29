import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

type Role = "Super Admin" | "Admin" | "User";

interface AuthTokenPayload {
  role: Role;
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("WTBkR2VWbFhNVFk9")?.value;
  const pathname = request.nextUrl.pathname;

  // Allow login and users pages
  if (pathname === "/" || pathname === "/users") {
    return NextResponse.next();
  }

  // Redirect unauthenticated users
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as AuthTokenPayload;

    const role = decoded.role.toLowerCase().replace(/\s+/g, "");

    // Admin-only pages: Admin and Super Admin
    if (
      pathname.startsWith("/admin") &&
      !["admin", "superadmin"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Super Admin-only pages
    if (pathname.startsWith("/terminal-nodes") && role !== "superadmin") {
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
