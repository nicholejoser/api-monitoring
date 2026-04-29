"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DailyConsumption {
  id: number;
  terminalNodeId: number;
  createdAt: string;
  consumptionDay: string;
  up: string;
  down: string;
}

interface ChartData {
  date: string;
  label: string;
  up: number;
  down: number;
}
function toGB(value: number) {
  return value / (1024 * 1024 * 1024);
}

// function transformDailyData(data: DailyConsumption[]): ChartData[] {
//   return data
//     .map((item) => ({
//       day: new Date(item.consumptionDay).getDate(),
//       up: toGB(Number(item.up)),
//       down: toGB(Number(item.down)),
//     }))
//     .sort((a, b) => a.day - b.day);
// }
function transformDailyData(data: DailyConsumption[]): ChartData[] {
  return data
    .map((item) => {
      const date = new Date(item.consumptionDay);

      return {
        date: item.consumptionDay,
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
        up: toGB(Number(item.up)),
        down: toGB(Number(item.down)),
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export default function Consumption({ data }: { data: DailyConsumption[] }) {
  const chartData = transformDailyData(data);
  const [gridType, setGridType] = useState<string>("2");

  return (
    <div className="w-full h-100">
      <div className="flex flex-row items-center justify-end">
        <Select defaultValue="2" value={gridType} onValueChange={setGridType}>
          <SelectTrigger className="w-30 h-11! bg-white border-slate-200 text-slate-500">
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
        <BarChart data={chartData}>
          {gridType === "0" ? (
            <CartesianGrid />
          ) : gridType === "1" ? (
            <CartesianGrid horizontal={false} />
          ) : (
            <CartesianGrid vertical={false} />
          )}

          <XAxis dataKey="label" interval="preserveStartEnd" minTickGap={20} />

          <YAxis tickFormatter={(value) => `${value.toFixed(0)} GB`} />

          <Tooltip
            formatter={(value, name) => {
              const num = typeof value === "number" ? value : Number(value);

              return [`${num.toFixed(2)} GB`, name as string];
            }}
            labelFormatter={(label, payload) => {
              const item = payload?.[0]?.payload;
              return new Date(item?.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
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
          {/* Clean & Professional */}
          {/* <Bar dataKey="up" stackId="a" fill="#7c3aed" name="Up" />
          <Bar dataKey="down" stackId="a" fill="#f59e0b" name="Down" /> */}
          {/* Clean Tech Look */}
          <Bar dataKey="up" stackId="a" fill="#22c55e" name="Down" />
          <Bar dataKey="down" stackId="a" fill="#0ea5e9" name="Up" />
          {/* <Bar dataKey="up" stackId="a" fill="#0ea5e9" name="Up" />
          {/* High Contrast */}
          {/* <Bar dataKey="up" stackId="a" fill="#10b981" name="Up" />
          <Bar dataKey="down" stackId="a" fill="#ef4444" name="Down" /> */}
          {/* Dark Theme Friendly */}
          {/* <Bar dataKey="up" stackId="a" fill="#a78bfa" name="Up" />
          <Bar dataKey="down" stackId="a" fill="#f97316" name="Down" /> */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
