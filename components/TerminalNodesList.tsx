import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { cn, formatMonthYear, getEndOfMonth, getStartOfMonth } from "@/lib/utils";
import { ConsumptionGroupedByClient, TerminalNode } from "./Types";
import { toast } from "sonner";

interface TerminalNodesListProps {
  files: string[];
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setTerminalNodeData: React.Dispatch<React.SetStateAction<TerminalNode[]>>;
  setConsumptionGroupData: React.Dispatch<
    React.SetStateAction<ConsumptionGroupedByClient[]>
  >;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}
export default function TerminalNodesList({
  files,
  selected,
  setSelected,
  setIsLoading,
  setTerminalNodeData,
  setConsumptionGroupData,
  setStartDate,
  setEndDate,
}: TerminalNodesListProps) {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!selected) return;

    const fetchSelectedData = async () => {
      try {
        setIsLoading(true);
        const date = new Date(selected);
        setStartDate(getStartOfMonth(date));
        setEndDate(getEndOfMonth(date));
        const [terminalRes, consumptionRes] = await Promise.all([
          fetch(`/data/${selected}/filtered_terminal_nodes.json`),
          fetch(`/data/${selected}/consumption_data.json`),
        ]);

        const [terminalData, consumptionData] = await Promise.all([
          terminalRes.json(),
          consumptionRes.json(),
        ]);

        setTerminalNodeData(terminalData);
        setConsumptionGroupData(consumptionData);

        toast.success("Data loaded successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load selected data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSelectedData();
  }, [
    selected,
    setConsumptionGroupData,
    setEndDate,
    setIsLoading,
    setStartDate,
    setTerminalNodeData,
  ]);
  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-72 h-11 justify-between bg-white border-gray-300 shadow-sm"
          >
            {selected ? formatMonthYear(selected) : "Select data"}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-0">
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
    </div>
  );
}
