import { DailyConsumption } from "./Types";
import { formatBytes, monthNames } from "../lib/utils";
import * as XLSX from "xlsx";
import { DatabaseSearch, Download, Upload } from "lucide-react";
import Consumption from "./Consumption";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

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
        className="!max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl"
        aria-describedby={undefined}
      >
        {/* Header */}
        <DialogHeader className="px-7 py-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800 font-lexend">
                Consumption Overview
              </DialogTitle>

              <p className="text-sm text-slate-500 mt-1">
                {data.length > 0 ? (
                  <>
                    {data[0].clientName}
                    <span className="mx-2 text-slate-300">|</span>
                    Client ID: <span className="font-semibold">{id}</span>
                  </>
                ) : (
                  `Client ID: ${id}`
                )}
              </p>
            </div>

            {data.length > 0 && (
              <button
                onClick={() => handleExportConsumption(data)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 md:p-7 bg-slate-50/70 font-lexend">
          {data.length === 0 ? (
            <div className="min-h-64 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <DatabaseSearch className="w-7 h-7 text-slate-400" />
              </div>

              <h3 className="font-semibold text-slate-700">
                No consumption data
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                There are no consumption records available for this client.
              </p>
            </div>
          ) : (
            <>
              {/* History + Chart */}
              <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] gap-5">
                {/* Consumption History */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Consumption History
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Daily upload and download records
                      </p>
                    </div>

                    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                      {data.length} records
                    </span>
                  </div>

                  <div className="max-h-[55vh] overflow-y-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-slate-100 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                            No.
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-blue-600 uppercase">
                            Upload
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-600 uppercase">
                            Download
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.map((row, index) => (
                          <tr
                            key={row.id}
                            className="border-t border-slate-100 hover:bg-blue-50/60 transition-colors"
                          >
                            <td className="px-4 py-3 text-slate-400">
                              {index + 1}
                            </td>

                            <td className="px-4 py-3 text-nowrap font-medium text-slate-700">
                              {row.consumptionDay}
                            </td>

                            <td className="px-4 py-3 text-right text-blue-600 font-medium">
                              {formatBytes(Number(row.up))}
                            </td>

                            <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                              {formatBytes(Number(row.down))}
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      <tfoot className="bg-slate-100 sticky bottom-0 z-10">
                        <tr className="border-t border-slate-200 font-semibold">
                          <td colSpan={2} className="px-4 py-4 text-slate-700">
                            Total
                          </td>

                          <td className="px-4 py-4 text-right text-blue-700">
                            {formatBytes(totalUp)}
                          </td>

                          <td className="px-4 py-4 text-right text-emerald-700">
                            {formatBytes(totalDown)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Chart */}
                <div className="w-full flex flex-col items-start justify-center gap-5">
                  <div className="w-full h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-800">
                        Consumption Analytics
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Upload and download trends
                      </p>
                    </div>

                    <div className="w-full h-112.5 p-4">
                      <Consumption data={data} />
                    </div>
                  </div>
                  {/* Summary Cards */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">
                          Total Upload
                        </span>
                        <div className="p-2 rounded-lg bg-blue-50">
                          <Upload className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>

                      <p className="text-2xl font-bold text-slate-800 mt-3">
                        {formatBytes(totalUp)}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {totalUp.toLocaleString()} bytes
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">
                          Total Download
                        </span>
                        <div className="p-2 rounded-lg bg-emerald-50">
                          <Download className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>

                      <p className="text-2xl font-bold text-slate-800 mt-3">
                        {formatBytes(totalDown)}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {totalDown.toLocaleString()} bytes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
