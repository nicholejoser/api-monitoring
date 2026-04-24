import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DailyConsumption } from "./Types";
import { formatBytes, monthNames } from "@/lib/utils";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import Consumption from "./Consumption";

type DialogScrollableContentProps = {
  data: DailyConsumption[];
  id: number;
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
};

export function DialogScrollableContent({
  data,
  id,
  openDialog,
  setOpenDialog,
}: DialogScrollableContentProps) {
  const totalUp = data.reduce((sum, row) => sum + Number(row.up), 0);
  const totalDown = data.reduce((sum, row) => sum + Number(row.down), 0);

  const handleExportConsumption = (data: DailyConsumption[]) => {
    if (data.length === 0) return;
    const date = new Date(data[0].consumptionDay);
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const formatted = data.map((item) => ({
      Date: item.consumptionDay,
      Upload: Number(item.up),
      Download: Number(item.down),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consumption");

    XLSX.writeFile(workbook, `${id}-Consumption-Logs-${month}-${year}.xlsx`);
  };
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent
        className="max-w-300! "
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="font-lexend">
            Consumption for Client ID: {id}
          </DialogTitle>

          <div className="w-full flex flex-row items-center justify-end">
            {data.length > 1 && (
              <button
                onClick={() => handleExportConsumption(data)}
                className="w-fit flex flex-row items-center gap-1 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-2.5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.97]"
              >
                <Download className="w-5 h-5 shrink-0" />
                Export to Excel
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="w-full flex flex-row items-center gap-5 max-h-[50vh] px-4 font-lexend">
          <div className="w-150 rounded-lg border border-slate-200 overflow-hidden">
            <div className="max-h-[50vh] overflow-y-auto no-scrollbar">
              {data.length === 0 ? (
                <p className="text-slate-500 p-4">No data available</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-200 sticky top-0 z-10 ">
                    <tr>
                      <th className="p-2 text-left">No.</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Upload</th>
                      <th className="p-2 text-left">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => (
                      <tr
                        key={row.id}
                        className="border-t even:bg-slate-100 hover:bg-blue-100"
                      >
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2 text-nowrap">{row.consumptionDay}</td>
                        <td className="p-2">{row.up}</td>
                        <td className="p-2">{row.down}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-200 sticky bottom-0 z-10">
                    <tr className="font-semibold border-t">
                      <td className="p-2"></td>
                      <td className="p-2">Total</td>
                      <td className="p-2">
                        {formatBytes(totalUp)}
                        <div className="text-xs text-slate-500">
                          {totalUp.toLocaleString()} bytes
                        </div>
                      </td>
                      <td className="p-2">
                        {formatBytes(totalDown)}
                        <div className="text-xs text-slate-500">
                          {totalDown.toLocaleString()} bytes
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
          <Consumption data={data} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
