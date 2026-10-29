import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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
  const kill = process.env.KILL;
  if (!kill) {
    throw new Error("FiberVu authentication configuration is missing.");
  }
  const token = request.cookies.get(kill)?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname === "/" || pathname === "/users") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as AuthTokenPayload;

    const role = roleMap[decoded.role];
    console.log(role);
    if (!role) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Super Admin and Admin only
    if (
      pathname.startsWith("/admin") &&
      !["admin", "super admin"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Super Admin only
    if (pathname.startsWith("/terminal-nodes") && role !== "super admin") {
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
