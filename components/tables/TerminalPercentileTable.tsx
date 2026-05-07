"use client";

import { useState, useMemo } from "react";
import {
  ConsumptionGroupedByClient,
  DailyConsumption,
  TerminalNode,
} from "../Types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DialogScrollableContent } from "../DialogScrollableContent";
import { formatBytes, percentile } from "../../lib/utils";
import { ChevronDown, ChevronUp, DatabaseSearch, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { DatePickerInput } from "../DatePickerInput";
interface TerminalTableProps {
  terminalNodedata: TerminalNode[];
  consumptionData: ConsumptionGroupedByClient[];
  selectedDate?: string | null;
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}
export default function TerminalPercentileTable({
  terminalNodedata,
  consumptionData,
  selectedDate,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: TerminalTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const normalizeDate = (date: Date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };
  const consumptionMap = useMemo(() => {
    const map: Record<number, DailyConsumption[]> = {};

    consumptionData.forEach((item) => {
      map[Number(item.clientId)] = item.data;
    });

    return map;
  }, [consumptionData]);
  // 🔍 Filtered data
  const filteredData = useMemo(() => {
    return terminalNodedata.filter((item) => {
      const matchSearch =
        `${item.clientName} ${item.cityName} ${item.status} ${item.packageName} ${item.oltName} ${item.serialNumber} ${item.clientId}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchPackage =
        packageFilter === "all" ||
        !(item.packageName ?? "")
          .toLowerCase()
          .includes(packageFilter.toLowerCase());

      return matchSearch && matchStatus && matchPackage;
    });
  }, [terminalNodedata, search, statusFilter, packageFilter]);

  const enrichedData = useMemo(() => {
    return filteredData.map((item) => {
      const clientConsumption = consumptionMap[item.clientId] || [];

      const filteredConsumption = clientConsumption.filter((row) => {
        if (!startDate && !endDate) return true;

        const rowDate = normalizeDate(new Date(row.consumptionDay));
        const start = startDate ? normalizeDate(startDate) : null;
        const end = endDate ? normalizeDate(endDate) : null;

        if (start && rowDate < start) return false;
        if (end && rowDate > end) return false;

        return true;
      });

      // per-day values (important change)
      const upValues = filteredConsumption.map((row) => Number(row.up));
      const downValues = filteredConsumption.map((row) => Number(row.down));

      const totalUp = upValues.reduce((sum, v) => sum + v, 0);
      const totalDown = downValues.reduce((sum, v) => sum + v, 0);

      // NEW: per-client percentile (this is the key change)
      const upload95 = percentile(upValues, 95);
      const download95 = percentile(downValues, 95);
      //   console.log("UPLOAD VALUES", upValues);
      //   console.log(
      //     "SORTED",
      //     [...upValues].sort((a, b) => a - b),
      //   );
      //   console.log("UPLOAD 95TH", upload95);
      return {
        ...item,
        totalUp,
        totalDown,
        upload95,
        download95,
      };
    });
  }, [filteredData, consumptionMap, startDate, endDate]);

  const sortData = <T,>(
    array: T[],
    key: keyof T,
    direction: "asc" | "desc",
  ): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  };
  // 📄 Pagination
  //   const totalPages = Math.ceil(filteredData.length / limit);

  //   const paginatedData = useMemo(() => {
  //     const start = (page - 1) * limit;
  //     return filteredData.slice(start, start + limit);
  //   }, [filteredData, page, limit]);
  const totalPages =
    limit === terminalNodedata.length
      ? 1
      : Math.ceil(filteredData.length / limit);
  const start = (page - 1) * limit;

  const sortedData = useMemo(() => {
    if (!sortConfig) return enrichedData;

    return sortData(
      enrichedData,
      sortConfig.key as keyof TerminalNode,
      sortConfig.direction,
    );
  }, [enrichedData, sortConfig]);

  const paginatedData =
    limit === terminalNodedata.length
      ? sortedData
      : sortedData.slice(start, start + limit);
  const selectedConsumption = selectedClientId
    ? consumptionMap[selectedClientId] || []
    : [];

  const handleExportTable = () => {
    if (sortedData.length === 0) return;

    const formatted = sortedData.map((item, index) => ({
      No: index + 1,
      ID: item.clientId,
      Client: item.clientName,
      City: item.cityName,
      Status: item.status,
      Package: item.packageName,
      OLT: item.oltName,
      Serial: item.serialNumber,
      Upload_Bytes: item.totalUp,
      Download_Bytes: item.totalDown,
      Upload: formatBytes(item.totalUp),
      Download: formatBytes(item.totalDown),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Terminal Data");

    XLSX.writeFile(workbook, `Terminal-Table.xlsx`);
  };

  return (
    <div className="w-full font-lexend text-sm">
      <div className="flex justify-between mb-3">
        <div className="flex flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            className="w-full min-w-45 max-w-75 border border-slate-300 px-3 h-11 rounded-lg"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div className="flex flex-row items-center gap-3">
            <DatePickerInput date={startDate} setDate={setStartDate} />
            <DatePickerInput date={endDate} setDate={setEndDate} />
          </div>
        </div>
        <div className="flex flex-row items-center gap-3">
          <Select
            value={String(limit)}
            onValueChange={(e) => {
              setLimit(e === "all" ? terminalNodedata.length : Number(e));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-20 h-11! bg-white border-slate-300 text-slate-500 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-white">
              <SelectGroup>
                <SelectItem
                  value="10"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  10
                </SelectItem>
                <SelectItem
                  value="50"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  50
                </SelectItem>
                <SelectItem
                  value="100"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  100
                </SelectItem>
                <SelectItem
                  value="1000"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  1000
                </SelectItem>
                <SelectItem
                  value="2000"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  2000
                </SelectItem>
                <SelectItem
                  value="3000"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  3000
                </SelectItem>
                <SelectItem
                  value="4000"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  4000
                </SelectItem>
                <SelectItem
                  value="5000"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  5000
                </SelectItem>
                {/* <SelectItem
                  value="all"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  All
                </SelectItem> */}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(e) => {
              setStatusFilter(e);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-30 h-11! bg-white border-slate-300 text-slate-500 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-white">
              <SelectGroup>
                <SelectItem
                  value="all"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  All Status
                </SelectItem>
                <SelectItem
                  value="Suspended"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  Suspended
                </SelectItem>
                <SelectItem
                  value="Connected"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  Connected
                </SelectItem>
                <SelectItem
                  value="Terminated"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  Terminated
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={packageFilter}
            onValueChange={(value) => {
              setPackageFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-20 h-11! bg-white border-slate-300 text-slate-500 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="bg-white w-[--radix-select-trigger-width]"
            >
              <SelectGroup>
                <SelectItem
                  value="all"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  All
                </SelectItem>
                <SelectItem
                  value="chm"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  CHM
                </SelectItem>
                <SelectItem
                  value="chb"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  CHB
                </SelectItem>
                <SelectItem
                  value="chv"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  CHV
                </SelectItem>
                <SelectItem
                  value="dia"
                  className="text-slate-500 hover:bg-slate-100 cursor-pointer trasition-all duration-300 ease-in-out p-2"
                >
                  DIA
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <button
            onClick={handleExportTable}
            className="w-fit flex items-center gap-1 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-2.5 py-3 rounded-md text-sm font-semibold transition-all shadow-lg shadow-emerald-200/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.97]"
          >
            <Download className="w-5 h-5 shrink-0" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* 📊 Table */}
      <div className="w-full flex flex-col items-center gap-5">
        <div className="w-full max-h-169.5 overflow-y-auto border border-slate-300 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-200 sticky top-0">
              <tr>
                <th className="p-2 text-left">No</th>
                 <th
                  className="p-2 text-left"
                  onClick={() =>
                    setSortConfig((prev) =>
                      prev?.key === "clientId" && prev.direction === "asc"
                        ? { key: "clientId", direction: "desc" }
                        : { key: "clientId", direction: "asc" },
                    )
                  }
                >
                  <div className="flex flex-row items-center gap-2 cursor-pointer">
                    ID
                    {sortConfig?.key === "clientId" ? (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      )
                    ) : null}
                  </div>
                </th>
                <th
                  className="p-2 text-left"
                  onClick={() =>
                    setSortConfig((prev) =>
                      prev?.key === "clientName" && prev.direction === "asc"
                        ? { key: "clientName", direction: "desc" }
                        : { key: "clientName", direction: "asc" },
                    )
                  }
                >
                  <div className="flex flex-row items-center gap-2 cursor-pointer">
                    Client
                    {sortConfig?.key === "clientName" ? (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      )
                    ) : null}
                  </div>
                </th>
                <th className="p-2 text-left">City</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Package</th>
                <th className="p-2 text-left">OLT</th>
                <th className="p-2 text-left">Serial</th>
                <th
                  className="p-2 text-left"
                  onClick={() =>
                    setSortConfig((prev) =>
                      prev?.key === "totalUp" && prev.direction === "asc"
                        ? { key: "totalUp", direction: "desc" }
                        : { key: "totalUp", direction: "asc" },
                    )
                  }
                >
                  <div className="flex flex-row items-center gap-2 cursor-pointer">
                    Upload
                    {sortConfig?.key === "totalUp" ? (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      )
                    ) : null}
                  </div>
                </th>
                <th
                  className="p-2 text-left"
                  onClick={() =>
                    setSortConfig((prev) =>
                      prev?.key === "totalDown" && prev.direction === "asc"
                        ? { key: "totalDown", direction: "desc" }
                        : { key: "totalDown", direction: "asc" },
                    )
                  }
                >
                  <div className="flex flex-row items-center gap-2 cursor-pointer">
                    Download
                    {sortConfig?.key === "totalDown" ? (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      )
                    ) : null}
                  </div>
                </th>
                <th
                  className="p-2 text-left"
                  onClick={() =>
                    setSortConfig((prev) =>
                      prev?.key === "upload95" && prev.direction === "asc"
                        ? { key: "upload95", direction: "desc" }
                        : { key: "upload95", direction: "asc" },
                    )
                  }
                >
                  <div className="flex flex-row items-center gap-2 cursor-pointer">
                    Upload (95th)
                    {sortConfig?.key === "upload95" ? (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      )
                    ) : null}
                  </div>
                </th>
                <th
                  className="p-2 text-left"
                  onClick={() =>
                    setSortConfig((prev) =>
                      prev?.key === "download95" && prev.direction === "asc"
                        ? { key: "download95", direction: "desc" }
                        : { key: "download95", direction: "asc" },
                    )
                  }
                >
                  <div className="flex flex-row items-center gap-2 cursor-pointer">
                    Download (95th)
                    {sortConfig?.key === "download95" ? (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      )
                    ) : null}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  return (
                    <tr
                      key={`${item.id}-${index}`}
                      onClick={() => {
                        setSelectedClientId(item.clientId);
                        setOpenDialog(true);
                      }}
                      className="border-t border-t-slate-300 even:bg-slate-100 hover:bg-blue-100 cursor-pointer"
                    >
                      <td className="p-2"> {(page - 1) * limit + index + 1}</td>
                      <td className="p-2">{item.clientId}</td>
                      <td className="p-2">{item.clientName}</td>
                      <td className="p-2">{item.cityName}</td>
                      <td className="p-2">
                        {item.status === "Suspended" ? (
                          <div className="px-2 py-1 rounded border border-red-500 bg-red-500/10 text-red-600 text-sm inline-block">
                            Suspended
                          </div>
                        ) : (
                          <div className="px-2 py-1 rounded border border-green-500 bg-green-500/10 text-green-600 text-sm inline-block">
                            Connected
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-nowrap">{item.packageName}</td>
                      <td className="p-2 text-nowrap">{item.oltName}</td>
                      <td className="p-2">{item.serialNumber}</td>
                      <td className="p-2">
                        {formatBytes(item.totalUp)}
                        <div className="text-xs text-slate-500">
                          {item.totalUp.toLocaleString()} bytes
                        </div>
                      </td>

                      <td className="p-2">
                        {formatBytes(item.totalDown)}
                        <div className="text-xs text-slate-500">
                          {item.totalDown.toLocaleString()} bytes
                        </div>
                      </td>
                      <td className="p-2">
                        {formatBytes(item.upload95)}
                        <div className="text-xs text-slate-500">
                          {item.upload95.toLocaleString()} bytes
                        </div>
                      </td>

                      <td className="p-2">
                        {formatBytes(item.download95)}
                        <div className="text-xs text-slate-500">
                          {item.download95.toLocaleString()} bytes
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="border-t border-slate-300">
                  <td colSpan={12} className="p-6">
                    <div className="flex flex-col items-center justify-center gap-3 text-center text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <DatabaseSearch className="w-6 h-6 text-slate-400" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-600">
                          No Data Found
                        </p>
                        <p className="text-xs text-slate-400">
                          There is currently no fetched data available.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {selectedClientId && (
            <DialogScrollableContent
              data={selectedConsumption}
              id={selectedClientId}
              openDialog={openDialog}
              setOpenDialog={setOpenDialog}
            />
          )}
        </div>
      </div>

      {/* 📄 Pagination Controls */}
      <div className="flex justify-between items-center mt-3">
        {/* 📊 Info */}
        <span className="text-sm">
          Showing {(page - 1) * limit + 1} -{" "}
          {Math.min(page * limit, filteredData.length)} of {filteredData.length}
        </span>

        {/* 🔢 Page Controls */}
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-2 border border-slate-500 bg-slate-500 hover:bg-white text-white hover:text-slate-500 transition-all duration-300 ease-in-out rounded-lg disabled:opacity-50 cursor-pointer active:scale-[.9]"
          >
            Prev
          </button>

          {/* Page Input */}
          <div className="flex items-center gap-1">
            <span className="text-sm">Page</span>

            <input
              type="number"
              value={page}
              min={1}
              max={totalPages}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (value >= 1 && value <= totalPages) {
                  setPage(value);
                }
              }}
              className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center"
            />

            <span className="text-sm">of {totalPages}</span>
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 border border-slate-500 bg-slate-500 hover:bg-white text-white hover:text-slate-500 transition-all duration-300 ease-in-out rounded-lg disabled:opacity-50 cursor-pointer active:scale-[.9]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
