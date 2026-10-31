import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  formatDate,
  incrementProgress,
  resetProgress,
  setRunning,
} from "@/lib/utils";
import { ConsumptionGroupedByClient, DailyConsumption } from "@/components/Types";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const BASE_URL = "https://110.93.79.226/api/fttx/terminal-nodes";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}


export async function GET(
  req: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const syncId = Number(id);

    if (!Number.isInteger(syncId) || syncId <= 0) {
      return NextResponse.json(
        { error: "Invalid synchronization ID" },
        { status: 400 },
      );
    }

    // Verify synchronization exists
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
        { error: "Synchronization not found" },
        { status: 404 },
      );
    }

    // Fetch saved consumption records belonging to this snapshot
    const consumptions = await prisma.daily_consumption.findMany({
      where: {
        terminalNode: {
          is: {
            syncId,
          },
        },
      },
      orderBy: [
        { consumptionDay: "asc" },
        { clientName: "asc" },
      ],
      select: {
        id: true,
        fiberVuId: true,
        clientName: true,
        consumptionDay: true,
        createdAt: true,
        down: true,
        up: true,
        terminalNodeId: true,
        terminalNode: {
          select: {
            clientId: true,
          },
        },
      },
    });

    // Group consumption records by client
    const grouped = new Map<number, DailyConsumption[]>();

    for (const item of consumptions) {
      const clientId = item.terminalNode.clientId;

      if (!grouped.has(clientId)) {
        grouped.set(clientId, []);
      }

      grouped.get(clientId)!.push({
        id: item.id,
        fiberVuId: item.fiberVuId,
        clientName: item.clientName,
        consumptionDay: item.consumptionDay,
        createdAt: item.createdAt.toISOString(),
        down: item.down,
        up: item.up,
        terminalNodeId: item.terminalNodeId,
      });
    }

    const results = Array.from(grouped.entries()).map(
      ([clientId, data]) => ({
        clientId,
        data,
      }),
    );

    return NextResponse.json({
      message: "Daily consumptions retrieved successfully",
      sync,
      totalClients: results.length,
      totalRecords: consumptions.length,
      results,
    });
  } catch (error) {
    console.error("Failed to retrieve daily consumptions:", error);

    return NextResponse.json(
      { error: "Failed to retrieve daily consumptions" },
      { status: 500 },
    );
  }
}
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const syncId = Number(id);

    if (!Number.isInteger(syncId) || syncId <= 0) {
      return NextResponse.json(
        { error: "Invalid synchronization ID" },
        { status: 400 },
      );
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Missing FiberVu token" },
        { status: 401 },
      );
    }

    const sync = await prisma.terminal_node_syncs.findUnique({
      where: { id: syncId },
    });

    if (!sync) {
      return NextResponse.json(
        { error: "Synchronization not found" },
        { status: 404 },
      );
    }

    const terminalNodes = await prisma.terminal_nodes.findMany({
      where: {
        syncId,
      },
    });

    const connectedClients = terminalNodes.filter(
      (client) => client.status?.toLowerCase().trim() === "connected",
    );

    console.log(`Connected clients: ${connectedClients.length}`);
    setRunning(true);
    resetProgress();
    const results: ConsumptionGroupedByClient[] = [];
    let totalFetched = 0;
    let totalSaved = 0;
    try {
      for (const client of connectedClients) {
        const baseUrl = `${BASE_URL}/${client.fiberVuId}/consumption-logs`;

        const filter = {
          order: "consumptionDay ASC",
          where: {
            and: [
              {
                consumptionDay: {
                  gt: formatDate(sync.startDate),
                },
              },
              {
                consumptionDay: {
                  lte: formatDate(sync.endDate),
                },
              },
            ],
          },
        };

        const url = `${baseUrl}?filter=${encodeURIComponent(
          JSON.stringify(filter),
        )}`;
        try {
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store",
          });

          if (!res.ok) {
            const errorBody = await res.text();

            console.error(
              `Consumption request failed for FiberVu ID ${client.fiberVuId}`,
              {
                status: res.status,
                statusText: res.statusText,
                response: errorBody,
                filter,
              },
            );

            continue;
          }
          const data: DailyConsumption[] = await res.json();
          if (!Array.isArray(data)) {
            console.error(
              `Invalid consumption response for FiberVu ID ${client.fiberVuId}`,
            );
            continue;
          }
          totalFetched += data.length;
          const records = data.map((item) => ({
            fiberVuId: item.id,
            clientName: item.clientName || client.clientName || "Unknown",
            consumptionDay: item.consumptionDay,
            createdAt: new Date(item.createdAt),
            down: item.down,
            terminalNodeId: client.id,
            up: item.up,
          }));
          const saved = await prisma.daily_consumption.createMany({
            data: records,
            skipDuplicates: true,
          });
          totalSaved += saved.count;
          console.log(
            `FiberVu ID ${client.fiberVuId}: ${data.length} records received, ${saved.count} records saved.`,
          );
          results.push({
            clientId: client.clientId,
            data,
          });
        } catch (error) {
          console.error(
            `Failed to fetch consumption for FiberVu ID ${client.fiberVuId}:`,
            error,
          );
        } finally {
          incrementProgress(1);
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } finally {
      setRunning(false);
    }

    return NextResponse.json({
      message: "Consumption data fetched successfully",
      syncId: id,
      totalClients: connectedClients.length,
      totalFetched,
      totalSaved,
      results,
    });
  } catch (error) {
    console.error("Consumption fetching failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch consumption data" },
      { status: 500 },
    );
  }
}
