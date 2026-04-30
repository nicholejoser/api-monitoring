import { NextResponse } from "next/server";
import { TerminalNode } from "@/components/Types";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const res = await fetch(
      "http://localhost:3000/data/terminal_nodes.json"
    );

    const data: TerminalNode[] = await res.json();

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
      "filtered_terminal_nodes.json"
    );

    fs.writeFileSync(
      outputPath,
      JSON.stringify(filtered, null, 2),
      "utf-8"
    );

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
      { status: 500 }
    );
  }
}