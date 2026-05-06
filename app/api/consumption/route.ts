import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  ConsumptionGroupedByClient,
  TerminalNode,
} from "../../../components/Types";

import {
  incrementProgress,
  isRunning,
  setRunning,
  resetProgress,
} from "../../../lib/utils";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reqType = searchParams.get("type");
  const token = searchParams.get("token");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const dateFolder = searchParams.get("date");
  if (!dateFolder) {
    return NextResponse.json({ error: "Missing date" }, { status: 401 });
  }
  // 1. Load terminal nodes file
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    dateFolder,
    "filtered_terminal_nodes.json",
  );

  const raw = fs.readFileSync(filePath, "utf-8");
  const terminalNodes: TerminalNode[] = JSON.parse(raw);

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  try {
    if (reqType === "single") {
      const clientID = searchParams.get("id");

      if (!clientID || isNaN(Number(clientID))) {
        return NextResponse.json(
          { error: "Invalid client ID" },
          { status: 400 },
        );
      }
      const client = terminalNodes.find((a) => a.clientId === Number(clientID));

      if (!client) {
        console.log("%cClient not found!", "color: red");
        return;
      }
      const baseUrl = `https://110.93.79.226/api/fttx/terminal-nodes/${client.id}/consumption-logs`;

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
      if (isRunning) {
        return NextResponse.json({ message: "Already running" });
      }
      const connectedClients = terminalNodes.filter((item: TerminalNode) => {
        return item.status?.toLowerCase().trim() === "connected";
      });
      console.log(`Connected clients: ${connectedClients.length}`);
      setRunning(true);
      resetProgress();
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
          incrementProgress(1);

          console.log(
            `[FETCH SUCCESS] Client ID: ${clientID} → records: ${data?.length ?? 0}`,
          );
        }

        await new Promise((r) => setTimeout(r, 50));
      }
      setRunning(false);

      // 4. Save to file
      const outputPath = path.join(
        process.cwd(),
        "public",
        "data",
        dateFolder,
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
    setRunning(false);

    return NextResponse.json(
      { error: "Failed to fetch upstream API" },
      { status: 500 },
    );
  }
}

//   if (isRunning) {
//     return NextResponse.json({ message: "Already running" });
//   }
//   const connectedClients = terminalNodes.filter((item: TerminalNode) => {
//     return item.status?.toLowerCase().trim() === "connected";
//   });
//   console.log(`Connected clients: ${connectedClients.length}`);
//   setRunning(true);
//   resetProgress();
//   const results: ConsumptionGroupedByClient[] = [];
//   const BATCH_SIZE = 100;
//   // 3. Loop each client
//   for (let i = 0; i < connectedClients.length; i += BATCH_SIZE) {
//     const batch = connectedClients.slice(i, i + BATCH_SIZE);

//     const promises = batch.map(async (client) => {
//       const clientID = client.clientId;
//       const terminalNodeId = client.id;

//       const baseUrl = `https://110.93.79.226/api/fttx/terminal-nodes/${terminalNodeId}/consumption-logs`;

//       const filter = {
//         order: "consumptionDay ASC",
//         where: {
//           and: [
//             { consumptionDay: { gt: startDate } },
//             { consumptionDay: { lte: endDate } },
//           ],
//         },
//       };

//       const url = `${baseUrl}?filter=${encodeURIComponent(
//         JSON.stringify(filter),
//       )}`;

//       try {
//         const res = await fetch(url, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             Accept: "application/json",
//           },
//           cache: "no-store",
//         });

//         if (!res.ok) return null;

//         const data = await res.json();

//         incrementProgress(1);

//         return {
//           clientId: clientID,
//           data,
//         };
//       } catch {
//         return null;
//       }
//     });

//     const batchResults = await Promise.all(promises);

//     const validResults = batchResults.filter(
//       (item): item is ConsumptionGroupedByClient => item !== null,
//     );

//     results.push(...validResults);
//     // Optional small delay between batches
//     await new Promise((r) => setTimeout(r, 100));
//   }
//   setRunning(false);

//   // 4. Save to file
//   const outputPath = path.join(
//     process.cwd(),
//     "public",
//     "data",
//     "2026-04-02",
//     "consumption_data2.json",
//   );

//   fs.mkdirSync(path.dirname(outputPath), { recursive: true });

//   fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

//   return NextResponse.json({
//     message: "Consumption data saved",
//     totalClients: connectedClients.length,
//     totalFetched: results.length,
//   });
// }
