import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { TerminalNode } from "@/components/Types";

export async function GET() {
  try {
    const inputPath = path.join(
      process.cwd(),
      "src",
      "data",
      "terminal_nodes.json"
    );

    const outputPath = path.join(
      process.cwd(),
      "src",
      "data",
      "filtered_terminal_nodes.json"
    );

    // Read file
    const rawData = fs.readFileSync(inputPath, "utf-8");
    const data: TerminalNode[] = JSON.parse(rawData);

    // STEP 1: remove Suspended
    const withoutSuspended = data.filter((item) => {
      return item.status?.toLowerCase().trim() !== "suspended";
    });

    // STEP 2: remove CHB packages
    const filtered = withoutSuspended.filter((item) => {
      const pkg = item.packageName?.toLowerCase() || "";
      return !pkg.includes("chb");
    });

    // Save filtered file
    fs.writeFileSync(
      outputPath,
      JSON.stringify(filtered, null, 2),
      "utf-8"
    );

    return NextResponse.json({
      message: "Filtering complete",
      total: data.length,
      afterSuspended: withoutSuspended.length,
      filtered: filtered.length,
      output: "/src/data/filtered_terminal_nodes.json",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}