import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { TerminalNode } from "../../../components/Types";

import {
  incrementProgress,
  isRunning,
  setRunning,
  resetProgress,
} from "../../../lib/utils";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const reqType = searchParams.get("type");
  const dateFolder = searchParams.get("date");
  console.log(reqType) 
  console.log(dateFolder) 
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }
  if (reqType === "exist" && dateFolder) {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      dateFolder,
      "terminal_nodes.json",
    );
    const raw = fs.readFileSync(filePath, "utf-8");
    const data: TerminalNode[] = JSON.parse(raw);
    console.log(data)
    return NextResponse.json(data);
  } else {
    if (isRunning) {
      return NextResponse.json({ message: "Already running" });
    }

    setRunning(true);
    resetProgress();

    const baseUrl = "https://110.93.79.226/api/views/fttx/terminal-nodes";
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
            or: [{ language: "US" }, { language: { eq: null } }],
          },
        };

        const url = `${baseUrl}?filter=${encodeURIComponent(
          JSON.stringify(filter),
        )}`;

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
        incrementProgress(data.length);

        if (data.length < LIMIT) {
          hasMore = false;
        } else {
          skip += LIMIT;
        }

        await new Promise((r) => setTimeout(r, 100));
      }

      setRunning(false);

      // Save file...
      const now = new Date();
      const dateFolder = now.toISOString().split("T")[0];
      // const timePart = now.toTimeString().split(" ")[0].replace(/:/g, "-");

      const dirPath = path.join(process.cwd(), "public", "data", dateFolder);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      // with time json file name
      // const fileName = `terminal_nodes_${timePart}.json`;
      const fileName = `terminal_nodes.json`;
      const filePath = path.join(dirPath, fileName);

      fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));

      return NextResponse.json({
        message: `Saved ${allData.length} records`,
        file: `${dateFolder}/${fileName}`,
      });
    } catch {
      setRunning(false);
      return NextResponse.json(
        { error: "Failed to fetch all data" },
        { status: 500 },
      );
    }
  }
}
