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
import {
  cn,
  formatMonthYear,
  getEndOfMonth,
  getStartOfMonth,
} from "@/lib/utils";
import { useDataStore } from "@/store/data-store";

interface TerminalNodesListProps {
  files: string[];
  selected: string;

  setSelected: React.Dispatch<React.SetStateAction<string>>;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

export default function TerminalNodesList({
  files,
  selected,
  setSelected,
  setStartDate,
  setEndDate,
}: TerminalNodesListProps) {
  const [open, setOpen] = useState(false);

  const refreshData = useDataStore((state) => state.refreshData);

  useEffect(() => {
    if (!selected) return;

    const date = new Date(selected);

    setStartDate(getStartOfMonth(date));
    setEndDate(getEndOfMonth(date));

    refreshData(selected);
  }, [selected, refreshData, setStartDate, setEndDate]);
  return (
    <div>
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
    </div>
  );
}
