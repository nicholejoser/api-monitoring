import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { tripleEncode } from "./lib/utils";

type RoleId = 1 | 2 | 3;

interface AuthTokenPayload {
  id: number;
  email: string | null;
  role: RoleId;
}

const roleMap: Record<RoleId, string> = {
  1: "super admin",
  2: "admin",
  3: "user",
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow the login page.
  if (pathname === "/" || pathname === "/users") {
    return NextResponse.next();
  }

  const raw = process.env.KILL;
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!raw || !jwtSecret) {
    console.error("Proxy configuration missing:", {
      cookieNameConfigured: Boolean(raw),
      jwtSecretConfigured: Boolean(jwtSecret),
    });
    
    return NextResponse.redirect(new URL("/", request.url));
  }
  const cookieName = tripleEncode(raw);

  const token = request.cookies.get(cookieName)?.value;

  console.log("Proxy authentication:", {
    pathname,
    cookieExists: Boolean(token),
  });

  if (!token) {
    console.log("No authentication cookie; redirecting to login.");
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
    const role = roleMap[decoded.role];

    console.log("JWT verified:", {
      userId: decoded.id,
      roleId: decoded.role,
      mappedRole: role,
    });

    if (!role) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      pathname.startsWith("/admin") &&
      !["admin", "super admin"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/terminal-nodes") && role !== "super admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error(
      "JWT verification failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
