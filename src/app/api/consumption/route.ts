import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  ConsumptionGroupedByClient,
  DailyConsumption,
  TerminalNode,
} from "@/components/Types";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reqType = searchParams.get("type");
  const clientID = searchParams.get("id");
  const token = searchParams.get("token");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  if (!clientID || isNaN(Number(clientID))) {
    return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const terminalNodeId = Number(clientID) - 1;

  const baseUrl = `https://110.93.79.226/api/fttx/terminal-nodes/${terminalNodeId}/consumption-logs`;

  const filter = {
    order: "consumptionDay ASC",
    where: {
      and: [
        { consumptionDay: { gt: startDate } },
        { consumptionDay: { lte: endDate } },
      ],
    },
  };

  const url = `${baseUrl}?filter=${encodeURIComponent(JSON.stringify(filter))}`;

  try {
    if (reqType === "single") {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        return NextResponse.json(
          { error: "Upstream API failed", details: data },
          { status: res.status },
        );
      }

      return NextResponse.json(data);
    } else if (reqType === "multiple") {
      // 1. Load terminal nodes file
      const terminalPath = path.join(
        process.cwd(),
        "src",
        "data",
        "terminal_nodes.json",
      );

      const terminalRaw = fs.readFileSync(terminalPath, "utf-8");
      const terminalNodes = JSON.parse(terminalRaw);

      // 2. Filter connected clients
      const connectedClients = terminalNodes.filter(
        (item: TerminalNode) => item.status === "Connected",
      );

      console.log(`Connected clients: ${connectedClients.length}`);

      const results: ConsumptionGroupedByClient[] = [];

      // 3. Loop each client
      for (const client of connectedClients) {
        const clientID = client.clientId;
        const terminalNodeId = client.id;
        console.log(
          `[FETCH START] Client ID: ${clientID}, Terminal Node ID: ${terminalNodeId}`,
        );
        const baseUrl = `https://110.93.79.226/api/fttx/terminal-nodes/${terminalNodeId}/consumption-logs`;

        const filter = {
          order: "consumptionDay ASC",
          where: {
            and: [
              { consumptionDay: { gt: startDate } },
              { consumptionDay: { lte: endDate } },
            ],
          },
        };

        const url = `${baseUrl}?filter=${encodeURIComponent(
          JSON.stringify(filter),
        )}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();

          results.push({
            clientId: client.clientId,
            data,
          });
          console.log(
            `[FETCH SUCCESS] Client ID: ${clientID} → records: ${data?.length ?? 0}`,
          );
        }

        await new Promise((r) => setTimeout(r, 50));
      }

      // 4. Save to file
      const outputPath = path.join(
        process.cwd(),
        "src",
        "data",
        "consumption_data.json",
      );

      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

      return NextResponse.json({
        message: "Consumption data saved",
        totalClients: connectedClients.length,
        totalFetched: results.length,
      });
    }
  } catch (error) {
    console.error("Proxy GET Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch upstream API" },
      { status: 500 },
    );
  }
}
