import { Users } from '@/components/Types';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import fs from "fs";
import path from "path";
export const runtime = 'nodejs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
function tripleEncode(input: string): string {
  return btoa(btoa(btoa(input)));
}
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reqType = searchParams.get("type")

  if (reqType === "login") {
    const filePath = path.join(process.cwd(), "public", "data", "users.json");

    const fileData = fs.readFileSync(filePath, "utf-8");
    const users: Users[] = JSON.parse(fileData);

    const { email, password } = await req.json();

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user.id,
      email: user.email,
    });

    const cookieStore = await cookies();
    const kill = tripleEncode("paramz")
    cookieStore.set(kill, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ message: "Login successful" });
  } else if (reqType === "fibervu-login") {
    const targetUrl = 'https://110.93.79.226/api/inca-users/login';

    const payload = {
      username: "broadband_api",
      password: "broadband_api"
    };
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store'
      });

      const data = await res.json();

      if (!res.ok) {
        return NextResponse.json(
          { error: "Login failed", details: data },
          { status: res.status }
        );
      }

      // Assuming the server returns a token, you can send it back to your frontend
      return NextResponse.json(data, { status: 200 });

    } catch (error: unknown) {
      console.error("Login Request Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

      return NextResponse.json(
        { error: "Failed to connect to authentication server", message: errorMessage },
        { status: 500 }
      );
    }
  } else if (reqType === "logout") {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");

    return NextResponse.json({ message: "Logged out" });
  }
}