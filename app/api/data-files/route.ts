import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), "public", "data");

    if (!fs.existsSync(baseDir)) {
      return NextResponse.json([]);
    }

    const excludedFolders = ["logs"]; // add more if needed

    const dateFolders = fs
      .readdirSync(baseDir)
      .filter((folder) => {
        const fullPath = path.join(baseDir, folder);

        return (
          fs.statSync(fullPath).isDirectory() &&
          !excludedFolders.includes(folder)
        );
      });

    return NextResponse.json(dateFolders);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to read data files" },
      { status: 500 }
    );
  }
}