import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const syncs = await prisma.terminal_node_syncs.findMany({
      orderBy: {
        pulledAt: "desc",
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        pulledAt: true,
        _count: {
          select: {
            records: true,
          },
        },
      },
    });

    return NextResponse.json(
      syncs.map((sync) => ({
        id: sync.id,
        startDate: sync.startDate,
        endDate: sync.endDate,
        pulledAt: sync.pulledAt,
        totalRecords: sync._count.records,
      })),
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to retrieve synchronization history" },
      { status: 500 },
    );
  }
}