import { cookies } from "next/headers";
import { NextResponse } from "next/server";
function tripleEncode(input: string): string {
  return btoa(btoa(btoa(input)));
}
export async function POST() {
  const cookieStore = await cookies();
  const kill = tripleEncode("paramz");
  // Delete cookie
  cookieStore.set(kill, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0), 
  });
  cookieStore.delete(kill);
  return NextResponse.json({ message: "Logged out successfully" });
}