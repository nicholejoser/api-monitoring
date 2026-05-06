"use client";
import BreadCrumb from "@/components/BreadCrumb";
import { DatePickerInput } from "@/components/DatePickerInput";
import Loading from "@/components/Loading";
import NewTerminalTable from "@/components/tables/NewTerminalTable";
import { useData } from "@/context/DataContext";
import {
  cn,
  formatMonthYear,
  formatNumber,
  getEndOfMonth,
  getStartOfMonth,
} from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  Download,
  Info,
  RefreshCcw,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConsumptionGroupedByClient, TerminalNode } from "@/components/Types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

export default function TerminalNodeSettings() {
  const { fvKill } = useData();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [terminalNodeData, setTerminalNodeData] = useState<TerminalNode[]>([]);
  const [consumptionGroupData, setConsumptionGroupData] = useState<
    ConsumptionGroupedByClient[]
  >([]);
  const [startDate, setStartDate] = useState<Date | undefined>(
    getStartOfMonth(),
  );
  const [open, setOpen] = useState<boolean>(false);

  const [endDate, setEndDate] = useState<Date | undefined>(getEndOfMonth());
  const [fetched, setFetched] = useState<number>(0);
  const [files, setFiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleTerminalNode = async () => {
    setIsLoading(true);
    fetch(`/api/terminalnodes?token=${fvKill}`, {
      method: "GET",
    });

    const interval = setInterval(async () => {
      const res = await fetch("/api/terminalnodes/progress");
      const data = await res.json();

      setFetched(data.fetched);
      if (!data.running) {
        clearInterval(interval);
        setIsLoading(false);
        toast.success(data.message);
        // fetchNewData();
      }
    }, 500);
  };
  const handleConsMultiple = async () => {
    setIsLoading(true);
    try {
      fetch(
        `/api/consumption?token=${fvKill}&type=multiple&date=${selected}&start=${startDate?.toLocaleDateString("en-CA")}&end=${endDate?.toLocaleDateString("en-CA")}`,
      );
      const interval = setInterval(async () => {
        const res = await fetch("/api/terminalnodes/progress");
        const data = await res.json();

        setFetched(data.fetched);
        if (!data.running) {
          clearInterval(interval);
          setIsLoading(false);
          toast.success(data.message, {
            description: `Total clients: ${data.totalClients}. Total fetched: ${data.totalFetched}`,
          });
        }
      }, 500);
    } catch (err) {
      console.error("Request failed:", err);
    }
  };
  // to generate the filtered clients, those status = "Connected" and excluding those packageName includes "CHB"
  const handleFilteredTerminalNode = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/filter-terminal-nodes?date=${selected}`);
      if (res.ok) {
        toast.success("Terminal Nodes Filtered", {
          description:
            "Only connected nodes are included; CHB package entries are excluded.",
        });
      }
      const data = await res.json();
      setTerminalNodeData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadFiles = async () => {
      try {
        const res = await fetch("/api/data-files");
        const data = await res.json();

        if (isMounted) {
          setFiles(data);
        }
      } catch {
        toast.error("Failed loading data options");
      }
    };

    loadFiles();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;

    const fetchSelectedData = async () => {
      try {
        setIsLoading(true);
        const date = new Date(selected);
        setStartDate(getStartOfMonth(date));
        setEndDate(getEndOfMonth(date));
        const res = await fetch(
          `/api/terminalnodes?token=${fvKill}&type=exist&date=${selected}`,
          { method: "GET" },
        );
        if (!res.ok) {
          toast.error(`Error fetching terminal nodes`, {
            description: `${res.status}`,
          });
        }
        const data = await res.json();

        setTerminalNodeData(data);

        toast.success("Terminal Node Data loaded successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load selected data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSelectedData();
  }, [
    fvKill,
    selected,
    setConsumptionGroupData,
    setEndDate,
    setIsLoading,
    setStartDate,
    setTerminalNodeData,
  ]);
  return (
    <div className="w-full flex flex-col justify-center gap-5">
      {isLoading && (
        <Loading
          title="Fetching Terminal Nodes"
          description={`Fetched ${formatNumber(fetched)} records so far...`}
        />
      )}
      {loading && (
        <Loading
          title="Filtering Terminal Nodes"
          description={`Filtered based on status connected and excluce CHB records`}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <BreadCrumb
            title="Terminal Node Settings"
            toolTipText={`Steps to Use Terminal Node Settings: \n
              1. Fetch Terminal Node first.
              2. Look at the Select Data dropdown option to check if a new option has been added.
              3. Select that option.
              4. You can now see the whole terminal node data.
              5. If you want to fetch the consumption logs, click the Filter Terminal Node button to remove unnecessary data such as Suspended, Terminated, and CHB.
              6. Before clicking Fetch Consumption, make sure you set the date for the data you prefer to fetch.`}
            toolTipIcon={Info}
          />
        </div>
        <div className="w-full flex flex-col bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/50 border border-white/60 p-5 gap-3">
          <div className="w-full flex flex-col justify-between lg:flex-row lg:items-center gap-6">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-52 h-11 justify-between bg-white border-gray-300 shadow-sm cursor-pointer"
                >
                  {selected ? formatMonthYear(selected) : "Select data"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-0">
                <Command>
                  <CommandInput placeholder="Search data..." />
                  <CommandEmpty>No data found.</CommandEmpty>

                  <CommandGroup>
                    {files.map((file) => (
                      <CommandItem
                        key={file}
                        value={`${formatMonthYear(file)} ${file}`} // 🔥 best
                        onSelect={() => {
                          setSelected(file);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="w-full flex flex-col">
                          <span>{formatMonthYear(file)}</span>
                          <span className="text-xs text-gray-400">
                            {file.split("/").pop()}
                          </span>
                        </div>

                        <Check
                          className={cn(
                            "ml-auto shrink-0 h-4 w-4",
                            selected === file ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex flex-row items-center gap-3">
              <button
                onClick={handleFilteredTerminalNode}
                className="w-fit flex items-center gap-1 bg-slate-600 border border-transparent text-white hover:bg-white hover:text-slate-600 hover:border-slate-600 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-slate-200/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.97]"
              >
                <Download className="w-5 h-5 shrink-0" />
                {loading ? "Processing..." : "Filter Terminal Nodes"}
              </button>
              <button
                onClick={handleTerminalNode}
                disabled={!fvKill}
                className={`px-3 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-black/10 active:scale-[0.97] flex items-center gap-2 ${fvKill ? "bg-slate-600 text-white border border-transparent hover:text-slate-600 hover:border-slate-600 hover:bg-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              >
                <RefreshCcw className="w-5 h-5 shrink-0 active:animate-spin" />
                Fetch Terminal Nodes
              </button>
            </div>
          </div>
          <div className="w-full">
            <NewTerminalTable
              data={terminalNodeData}
              consumptionData={consumptionGroupData}
            />
          </div>
        </div>
      </div>
      {/* ================= CONSUMPTION CARD ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Fetch Consumption Logs
          </h2>
        </div>
        <div className="bg-white p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <DatePickerInput date={startDate} setDate={setStartDate} />
              <DatePickerInput date={endDate} setDate={setEndDate} />
            </div>

            <button
              disabled={isLoading || !fvKill}
              onClick={handleConsMultiple}
              className={`
          min-w-45 px-6 py-2 rounded-lg text-sm font-medium
          transition-all flex items-center justify-center gap-2
          ${
            isLoading
              ? "bg-slate-400 text-white"
              : fvKill
                ? "bg-slate-600 text-white hover:bg-slate-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }
        `}
            >
              {isLoading ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                "Fetch Consumption Logs"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
