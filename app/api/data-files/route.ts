import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), "public", "data");

    if (!fs.existsSync(baseDir)) {
      return NextResponse.json([]);
    }
    // this is to request the files inside that folder
    // const dateFolders = fs.readdirSync(baseDir);

    // const files: string[] = [];

    // for (const folder of dateFolders) {
    //   const folderPath = path.join(baseDir, folder);

    //   if (fs.statSync(folderPath).isDirectory()) {
    //     const folderFiles = fs.readdirSync(folderPath);

    //     folderFiles.forEach((file) => {
    //       if (file.endsWith(".json")) {
    //         files.push(`/data/${folder}/${file}`);
    //       }
    //     });
    //   }
    // }

    // return NextResponse.json(files);

    const dateFolders = fs
      .readdirSync(baseDir)
      .filter((folder) =>
        fs.statSync(path.join(baseDir, folder)).isDirectory(),
      );

    return NextResponse.json(dateFolders);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to read data files" },
      { status: 500 },
    );
  }
}
