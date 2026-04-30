import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const foodie = request.cookies.get("WTBkR2VWbFhNVFk9")?.value;

  const isLoginPage =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/users";

  // allow login page
  if (isLoginPage) return NextResponse.next();

  // protect all routes
  if (!foodie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
