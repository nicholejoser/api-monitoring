import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TerminalNode } from "../../../components/Types";
import {
  incrementProgress,
  isRunning,
  setRunning,
  resetProgress,
} from "../../../lib/utils";

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

  // Retrieve records from PostgreSQL instead of reading JSON files.
  if (reqType === "exist") {
    try {
      const records = await prisma.terminal_nodes.findMany({
        orderBy: { name: "desc" },
      });

      // Preserve the FiberVu ID as `id` for existing frontend code.
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

      if (data.length === 0) {
        break;
      }

      // Process each record using FiberVu's ID as the unique key.
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

        const existing = await prisma.terminal_nodes.findUnique({
          where: { fiberVuId },
          select: { id: true },
        });

        const createData = {
          ...fields,
          fiberVuId,
          createdAt: new Date(createdAt),
          hookedAt: new Date(hookedAt),
          modifiedAt: new Date(modifiedAt),
          deletedAt: deletedAt ? new Date(deletedAt) : null,
          sipData: sipData,
          todoTaskIds: todoTaskIds,
        };

        const updateData = {
          ...createData,
        };

        await prisma.terminal_nodes.upsert({
          where: { fiberVuId },
          create: createData,
          update: updateData,
        });

        if (existing) {
          totalUpdated++;
        } else {
          totalCreated++;
        }
      }

      totalFetched += data.length;
      incrementProgress(data.length);

      if (data.length < LIMIT) {
        break;
      }

      skip += LIMIT;

      // Avoid sending requests too quickly to FiberVu.
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      message: "Terminal nodes synchronized successfully",
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
