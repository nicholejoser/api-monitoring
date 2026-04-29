"use client";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BandwidthData, ChartPoint } from "./Types";
import { useMemo, useState } from "react";
function transformData(data: BandwidthData[]): ChartPoint[] {
  const result: ChartPoint[] = [];

  data.forEach((entry) => {
    const baseTime = new Date(entry.subjectHour);

    Object.entries(entry.jsonData).forEach(([minute, value]) => {
      const date = new Date(baseTime);
      date.setMinutes(Number(minute));

      result.push({
        time: date.toISOString(),
        up: value.up / 1_000_000,
        down: value.down / 1_000_000,
      });
    });
  });

  return result.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );
}

export default function BandwidthChart({ data }: { data: BandwidthData[] }) {
  const chartData = transformData(data);
  const [modeType, setModeType] = useState<string>("area");
  const [gridType, setGridType] = useState<string>("2");
  // const [page, setPage] = useState(0);
  // const DAYS_PER_PAGE = 7;
  // const paginatedData = useMemo(() => {
  //   if (!chartData.length) return [];

  //   const sorted = [...chartData].sort(
  //     (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  //   );

  //   const lastDate = new Date(sorted[sorted.length - 1].time);

  //   const end = new Date(lastDate);
  //   end.setDate(end.getDate() - page * DAYS_PER_PAGE);

  //   const start = new Date(end);
  //   start.setDate(start.getDate() - DAYS_PER_PAGE);

  //   return sorted.filter((item) => {
  //     const t = new Date(item.time);
  //     return t >= start && t <= end;
  //   });
  // }, [chartData, page]);

  const rangeLabel = useMemo(() => {
    if (!chartData.length) return "";

    const start = new Date(chartData[0].time);
    const end = new Date(chartData[chartData.length - 1].time);

    return `${start.toLocaleString()} - ${end.toLocaleString()}`;
  }, [chartData]);
  return (
    <div className="w-full h-100 font-lexend text-sm">
      <div className="w-full text-center">
        <p className="text-sm text-gray-500">{rangeLabel}</p>
      </div>
      <div className="flex flex-row gap-2 pb-5">
        <button
          onClick={() => setModeType("area")}
          className={`px-4 py-3 rounded-lg text-white cursor-pointer ${modeType === "area" ? "bg-[#f59e0b]" : "bg-gray-300"}`}
        >
          Area
        </button>
        <button
          onClick={() => setModeType("line")}
          className={`px-4 py-3 rounded-lg text-white cursor-pointer ${modeType === "line" ? "bg-[#f59e0b]" : "bg-gray-300"}`}
        >
          Line
        </button>
        <Select defaultValue="2" value={gridType} onValueChange={setGridType}>
          <SelectTrigger className="w-45 h-11! bg-white border-slate-200 text-slate-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white">
            <SelectGroup>
              <SelectItem
                value="0"
                className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
              >
                All
              </SelectItem>
              <SelectItem
                value="1"
                className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
              >
                Vertical
              </SelectItem>
              <SelectItem
                value="2"
                className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
              >
                Horizontal
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer>
        <AreaChart data={chartData}>
          {gridType === "0" ? (
            <CartesianGrid />
          ) : gridType === "1" ? (
            <CartesianGrid horizontal={false} />
          ) : (
            <CartesianGrid vertical={false} />
          )}

          {modeType === "line" ? (
            <>
              {/* Gradient fills */}
              <defs>
                <linearGradient id="downColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="upColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Time axis */}
              <XAxis
                dataKey="time"
                tickFormatter={(time) =>
                  new Date(time).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                minTickGap={40}
              />

              <YAxis tickFormatter={(value) => value.toFixed(2)} />

              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value, name) => {
                  const num = typeof value === "number" ? value : Number(value);

                  return [`${num.toFixed(2)}`, name as string];
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  padding: "10px 14px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelStyle={{
                  color: "#6b7280",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
                itemStyle={{
                  fontWeight: 500,
                }}
              />

              <Legend />

              {/* DOWN (background dominant) */}
              <Area
                type="linear" // 🔥 keeps spikes sharp
                dataKey="down"
                stroke="#f59e0b"
                fill="url(#downColor)"
                strokeWidth={1.5}
                name="Down (MBit/s)"
              />

              {/* UP (overlay) */}
              <Area
                type="linear"
                dataKey="up"
                stroke="#7c3aed"
                fill="url(#upColor)"
                strokeWidth={1.5}
                name="Up (MBit/s)"
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="time"
                tickFormatter={(time) =>
                  new Date(time).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                minTickGap={40}
              />
              {/* unit=" Mbps"  */}
              <YAxis tickFormatter={(value) => value.toFixed(2)} />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value, name) => {
                  const num = typeof value === "number" ? value : Number(value);

                  return [`${num.toFixed(2)}`, name as string];
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  padding: "10px 14px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelStyle={{
                  color: "#6b7280",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
                itemStyle={{
                  fontWeight: 500,
                }}
              />
              <Legend />

              {/* Download (bigger, background) */}
              <Area
                type="monotone"
                dataKey="down"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
                name="Down (MBit/s)"
              />

              {/* Upload (overlay) */}
              <Area
                type="monotone"
                dataKey="up"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={0.4}
                name="Up (MBit/s)"
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
