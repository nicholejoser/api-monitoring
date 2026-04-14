import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('id');

  // Using the exact URL you provided
  const externalUrl = `https://110.93.79.226/api/views/clients/${clientId}`;

  const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2MyIsImlkIjoiSjluMjRoVnRBTXdHIiwiaWF0IjoxNzc2MTQ0MjYxLCJleHAiOjE3NzYyMzA2NjF9.XrD3OV8pt2KU2uyIWQKiDTBcU30vTJWMkJfqEUeT772t2r1taMU-5eZUTyRD9fWU6O0fcrkdbZVk5pKYfrQGSg";

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
    } catch (parseError) {
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