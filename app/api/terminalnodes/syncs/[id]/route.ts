import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const syncId = Number(id);

    if (!Number.isInteger(syncId) || syncId <= 0) {
      return NextResponse.json(
        { error: "Invalid synchronization ID" },
        { status: 400 },
      );
    }

    const sync = await prisma.terminal_node_syncs.findUnique({
      where: { id: syncId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        pulledAt: true,
      },
    });

    if (!sync) {
      return NextResponse.json(
        { error: "Synchronization record not found" },
        { status: 404 },
      );
    }

    const records = await prisma.terminal_nodes.findMany({
      where: {
        syncId,
      },
      orderBy: {
        name: "desc",
      },
    });

    return NextResponse.json({
      sync,
      totalRecords: records.length,
      records,
    });
  } catch (error) {
    console.error("Failed to retrieve terminal node snapshot:", error);

    return NextResponse.json(
      { error: "Failed to retrieve terminal node data" },
      { status: 500 },
    );
  }
}
