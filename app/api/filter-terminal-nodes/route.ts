import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { TerminalNode } from "../../../components/Types";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "2026-04-02",
      "terminal_nodes_11-59-42.json",
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
      "2026-04-02",
      `filtered_terminal_nodes.json`,
    );

    fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2), "utf-8");

    return NextResponse.json({
      message: "Filtering complete",
      total: data.length,
      connectedOnly: connectedOnly.length,
      filtered: filtered.length,
      savedTo: "/data/filtered_terminal_nodes.json",
      data: filtered,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 },
    );
  }
}
