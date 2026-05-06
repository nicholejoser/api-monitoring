import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { TerminalNode } from "../../../components/Types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateFolder = searchParams.get("date");
  if (!dateFolder) {
    return NextResponse.json({ error: "Missing date" }, { status: 401 });
  }
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      dateFolder,
      "terminal_nodes.json",
    );

    const raw = fs.readFileSync(filePath, "utf-8");
    const data: TerminalNode[] = JSON.parse(raw);

    // STEP 1: ONLY Connected (not suspended, not terminated, etc.)
    const connectedOnly = data.filter((item) => {
      return item.status?.toLowerCase().trim() === "connected";
    });

    // STEP 2: remove CHB packages
    const filtered = connectedOnly.filter((item) => {
      const pkg = item.packageName?.toLowerCase() || "";
      return !pkg.includes("chb");
    });

    // SAVE FILE (DEV ONLY)
    const outputPath = path.join(
      process.cwd(),
      "public",
      "data",
      dateFolder,
      `filtered_terminal_nodes.json`,
    );

    fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2), "utf-8");

    return NextResponse.json(filtered);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 },
    );
  }
}
