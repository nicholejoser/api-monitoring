import { NextResponse } from 'next/server';
export const runtime = 'nodejs'; 

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function POST() {
  const targetUrl = 'https://110.93.79.226/api/inca-users/login';
  
  // The payload you provided
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
      // Convert the TypeScript object into a JSON string for the request body
      body: JSON.stringify(payload),
      // Optional: Add no-store if you want to ensure Next.js never caches this login request
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
}