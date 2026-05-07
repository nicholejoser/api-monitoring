import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { Log } from "@/components/Types";

export async function GET() {
  const dir = path.join(process.cwd(), "public/data/logs/logins");

  try {
    const files = fs.readdirSync(dir);

    const logs: Log[] = files.map((file) => {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      return JSON.parse(content);
    });

    logs.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}