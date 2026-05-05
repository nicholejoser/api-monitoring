import { NextResponse } from "next/server";
import { jobProgress, isRunning } from "../../../../lib/utils";

export async function GET() {
  return NextResponse.json({
    fetched: jobProgress,
    running: isRunning,
  });
}