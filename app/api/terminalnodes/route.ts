import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TerminalNode } from "../../../components/Types";
import {
  incrementProgress,
  isRunning,
  setRunning,
  resetProgress,
} from "../../../lib/utils";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const dynamic = "force-dynamic";

const BASE_URL = "https://110.93.79.226/api/views/fttx/terminal-nodes";
const LIMIT = 100;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const token = searchParams.get("token");
  const reqType = searchParams.get("type");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  // Retrieve existing terminal nodes.
  if (reqType === "exist") {
    try {
      const records = await prisma.terminal_nodes.findMany({
        orderBy: { name: "desc" },
      });

      const data = records.map(({ id, fiberVuId, ...record }) => ({
        ...record,
        id: fiberVuId,
        databaseId: id,
      }));

      return NextResponse.json(data);
    } catch (error) {
      console.error("Failed to retrieve terminal nodes:", error);

      return NextResponse.json(
        { error: "Failed to retrieve terminal nodes" },
        { status: 500 },
      );
    }
  }

  // Validate date parameters.
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  if (!startDateParam || !endDateParam) {
    return NextResponse.json(
      { error: "Missing startDate or endDate" },
      { status: 400 },
    );
  }

  // Store calendar dates without timezone conversion.
  const startDate = new Date(`${startDateParam}T00:00:00.000Z`);
  const endDate = new Date(`${endDateParam}T00:00:00.000Z`);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate > endDate
  ) {
    return NextResponse.json(
      { error: "Invalid date range" },
      { status: 400 },
    );
  }

  // Prevent overlapping synchronization requests.
  if (isRunning) {
    return NextResponse.json({ message: "Already running" }, { status: 409 });
  }

  setRunning(true);
  resetProgress();

  let skip = 0;
  let totalFetched = 0;
  let totalCreated = 0;
  let totalUpdated = 0;

  try {
    // Create synchronization batch.
    const syncBatch = await prisma.terminal_node_syncs.create({
      data: {
        startDate,
        endDate,
      },
    });

    while (true) {
      const filter = {
        skip,
        limit: LIMIT,
        order: "name DESC",
        where: {
          or: [{ language: "US" }, { language: { eq: null } }],
        },
      };

      const url = `${BASE_URL}?filter=${encodeURIComponent(
        JSON.stringify(filter),
      )}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(
          `FiberVu request failed at skip=${skip}: HTTP ${res.status}`,
        );
      }

      const data: TerminalNode[] = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("FiberVu returned an invalid response");
      }

      if (data.length === 0) break;

      for (const node of data) {
        const {
          id: fiberVuId,
          createdAt,
          hookedAt,
          modifiedAt,
          deletedAt,
          sipData,
          todoTaskIds,
          ...fields
        } = node;

        const createData = {
          ...fields,
          fiberVuId,
          syncId: syncBatch.id,
          createdAt: new Date(createdAt),
          hookedAt: new Date(hookedAt),
          modifiedAt: new Date(modifiedAt),
          deletedAt: deletedAt ? new Date(deletedAt) : null,
          sipData,
          todoTaskIds: todoTaskIds ?? [],
        };

        // Check whether this FiberVu node already exists
        // in the current synchronization batch.
        const existing = await prisma.terminal_nodes.findUnique({
          where: {
            fiberVuId_syncId: {
              fiberVuId,
              syncId: syncBatch.id,
            },
          },
          select: { id: true },
        });

        await prisma.terminal_nodes.upsert({
          where: {
            fiberVuId_syncId: {
              fiberVuId,
              syncId: syncBatch.id,
            },
          },
          create: createData,
          update: createData,
        });

        if (existing) {
          totalUpdated++;
        } else {
          totalCreated++;
        }
      }

      totalFetched += data.length;
      incrementProgress(data.length);

      if (data.length < LIMIT) break;

      skip += LIMIT;

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      message: "Terminal nodes synchronized successfully",
      syncId: syncBatch.id,
      startDate,
      endDate,
      totalFetched,
      totalCreated,
      totalUpdated,
    });
  } catch (error) {
    console.error("Terminal node synchronization failed:", error);

    return NextResponse.json(
      { error: "Failed to synchronize terminal nodes" },
      { status: 500 },
    );
  } finally {
    setRunning(false);
  }
}