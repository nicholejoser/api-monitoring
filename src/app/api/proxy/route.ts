import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('id');
  const token = searchParams.get('token');

  // Using the exact URL you provided
  const externalUrl = `https://110.93.79.226/api/views/clients/${clientId}`;

  try {
    const res = await fetch(externalUrl, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      cache: 'no-store'
    });

    // 1. Get the raw text FIRST, before trying to parse JSON
    const rawText = await res.text();

    // 2. Check if the server returned an error status (like 401, 404, or 500)
    if (!res.ok) {
      return NextResponse.json({ 
        error: `Server returned status ${res.status}`, 
        body: rawText // This will reveal if it's an HTML error page!
      }, { status: res.status });
    }

    // 3. If it is OK, safely try to parse the JSON
    try {
      const data = JSON.parse(rawText);
      return NextResponse.json(data);
    } catch {
      // If it fails to parse, it means the server sent back plain text/HTML on a 200 OK
      return NextResponse.json({
        error: "Server did not return valid JSON",
        receivedText: rawText
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("Proxy Fetch Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    return NextResponse.json(
      { error: "Failed to connect to external IP", message: errorMessage }, 
      { status: 500 }
    );
  }
}


// ⚠️ Required to bypass SSL certificate errors when hitting an IP address directly via HTTPS
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