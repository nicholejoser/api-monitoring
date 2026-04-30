import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientID = searchParams.get("id");
  const token = searchParams.get("token");
  const baseUrl = `https://110.93.79.226/api/fttx/terminal-nodes/${Number(clientID) - 1}/bandwidth`;

  const filter = {
    order: "subjectHour ASC",
    where: {
      and: [
        {
          subjectHour: {
            gt: "2026-04-14T16:53:46",
          },
        },
        {
          subjectHour: {
            lte: "2026-04-21T16:53:46",
          },
        },
      ],
    },
    include: {},
  };

  const url = `${baseUrl}?filter=${encodeURIComponent(JSON.stringify(filter))}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream API failed", details: data },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy GET Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch upstream API",
      },
      { status: 500 },
    );
  }
}
