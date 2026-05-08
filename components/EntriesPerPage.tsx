import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface EntriesPerPageProps {
  limit: number;
  setLimit: (limit: number) => void;
  setPage: (page: number) => void;
  total?: number;
}

export default function EntriesPerPage({
  limit,
  setLimit,
  setPage,
  total,
}: EntriesPerPageProps) {
  return (
    <Select
      value={String(limit)}
      onValueChange={(value) => {
        const newLimit = value === "all" ? (total ?? 0) : Number(value);

        setLimit(newLimit);
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
  );
}
