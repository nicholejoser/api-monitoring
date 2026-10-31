"use client";

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
import { cn, formatDate } from "@/lib/utils";
import { useDataStore } from "@/store/data-store";
import { TerminalNodeSync } from "./Types";

interface Props {
  syncs: TerminalNodeSync[];
  selected: number | null;
  setSelected: React.Dispatch<React.SetStateAction<number | null>>;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

const formatDateRange = (startDate: Date, endDate: Date) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export default function TerminalNodesList({
  syncs,
  selected,
  setSelected,
  setStartDate,
  setEndDate,
}: Props) {
  const [open, setOpen] = useState(false);
  const refreshData = useDataStore((state) => state.refreshData);
  const fetchSavedConsumptions = useDataStore(
    (state) => state.fetchSavedConsumptions,
  );
  const selectedSync = syncs.find((sync) => sync.id === selected);

  useEffect(() => {
    if (selected === null || !selectedSync) return;
    setStartDate(new Date(selectedSync.startDate));
    setEndDate(new Date(selectedSync.endDate));
    const loadSyncData = async () => {
      try {
        // Clear previous synchronization's consumption data
        useDataStore.getState().setConsumptionGroupData([]);

        // Fetch terminal nodes and saved consumptions simultaneously
        await Promise.all([
          refreshData(selected),
          fetchSavedConsumptions(selected),
        ]);
      } catch (error) {
        console.error("Failed to load synchronization data:", error);
      }
    };

    loadSyncData();
  }, [selected, refreshData, fetchSavedConsumptions, selectedSync, setStartDate, setEndDate]);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-64 h-11 justify-between bg-white border-gray-300 shadow-sm cursor-pointer"
          >
            <span className="truncate">
              {selectedSync
                ? formatDateRange(selectedSync.startDate, selectedSync.endDate)
                : "Select synchronization"}
            </span>

            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-0">
          <Command>
            <CommandInput placeholder="Search synchronization..." />

            <CommandEmpty>No synchronization found.</CommandEmpty>

            <CommandGroup>
              {syncs.map((sync) => (
                <CommandItem
                  key={sync.id}
                  value={`${formatDateRange(
                    sync.startDate,
                    sync.endDate,
                  )} ${sync.id} ${formatDate(sync.pulledAt)}`}
                  onSelect={() => {
                    setSelected(sync.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex w-full flex-col gap-1">
                    <span>{formatDateRange(sync.startDate, sync.endDate)}</span>

                    <span className="text-xs text-gray-400">
                      Pulled: {formatDate(sync.pulledAt)}
                    </span>

                    <span className="text-xs text-gray-400">
                      {sync.totalRecords.toLocaleString()} records
                    </span>
                  </div>

                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      selected === sync.id ? "opacity-100" : "opacity-0",
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
