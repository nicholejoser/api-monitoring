import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { TerminalNode } from "@/components/Types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const baseUrl =
    "https://110.93.79.226/api/views/fttx/terminal-nodes";

  const LIMIT = 100;
  let skip = 0;
  let allData: TerminalNode[] = [];
  let hasMore = true;

  try {
    while (hasMore) {
      const filter = {
        skip,
        limit: LIMIT,
        order: "name DESC",
        where: {
          or: [
            { language: "US" },
            { language: { eq: null } },
          ],
        },
      };

      const url = `${baseUrl}?filter=${encodeURIComponent(
        JSON.stringify(filter)
      )}`;

      console.log(`Fetching skip=${skip}`);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed at skip=${skip}`);
      }

      const data = await res.json();

      allData = allData.concat(data);

      if (data.length < LIMIT) {
        hasMore = false;
      } else {
        skip += LIMIT;
      }

      // 🔥 prevent rate limit
      await new Promise((r) => setTimeout(r, 100));
    }

    // ✅ ensure /data exists
    const filePath = path.join(process.cwd(), "data", "terminal_nodes.json");
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // ✅ save file
    fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));

    return NextResponse.json({
      message: `Saved ${allData.length} records`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch all data" },
      { status: 500 }
    );
  }
}