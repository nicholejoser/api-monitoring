import { NextRequest, NextResponse } from 'next/server';

// No Prisma import here!
const LEGIT_IDS = ["89833", "89789", "89788"];

export async function GET(
  req: NextRequest,
  { params }: { params: { terminalNodeId: string } }
) {
  const apiKey = req.headers.get('x-api-key');
  const { terminalNodeId } = params;

  // 1. Simple Key Validation
  if (apiKey !== 'abc123yourkeyhere') {
    return NextResponse.json({ error: "Invalid Key" }, { status: 403 });
  }

  // 2. ID Validation
  if (!LEGIT_IDS.includes(terminalNodeId)) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  // 3. Static Mock Data
  const mockData = [
    {
      id: 1,
      up: "500MB",
      down: "2.5GB",
      consumptionDay: "2026-04-13",
      terminalNodeId: Number(terminalNodeId)
    },
    {
      id: 2,
      up: "300MB",
      down: "1.2GB",
      consumptionDay: "2026-04-12",
      terminalNodeId: Number(terminalNodeId)
    }
  ];

  return NextResponse.json(mockData);
}