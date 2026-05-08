"use client";

import BreadCrumb from "@/components/BreadCrumb";
import EntriesPerPage from "@/components/EntriesPerPage";
import Loading from "@/components/Loading";
import { Log } from "@/components/Types";
import { DatabaseSearch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data.logs);
    } catch {
      toast.error("Failed to fetch logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);
  const filteredData = useMemo(() => {
    return logs.filter((item) => {
      const matchSearch = `${item.name} ${item.userId} ${item.username}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchSearch;
    });
  }, [logs, search]);
 
  const totalPages =
    limit === logs.length ? 1 : Math.ceil(filteredData.length / limit);
  const start = (page - 1) * limit;

  const paginatedData =
    limit === logs.length ? filteredData : filteredData.slice(start, start + limit);

  return (
    <div className="w-full flex flex-col justify-center gap-5">
      {loading && <Loading />}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <BreadCrumb title="Logs" />
        </div>
        <div className="flex flex-col items-start gap-3 p-6">
          <div className="w-full flex flex-row items-center justify-between">
            <EntriesPerPage
              limit={limit}
              setLimit={setLimit}
              setPage={setPage}
              total={filteredData.length}
            />
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
          </div>
          {/* 📊 Table */}
          <div className="w-full flex flex-col items-center gap-2">
            <div className="w-full max-h-169.5 overflow-y-auto border border-slate-300 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">No</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Timestamp </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr
                        key={`${item.userId}-${index}`}
                        className="border-t border-t-slate-300 even:bg-slate-100 hover:bg-blue-100 cursor-pointer"
                      >
                        <td className="p-2">
                          {" "}
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.role}</td>
                        <td className="p-2">{item.email}</td>
                        <td className="p-2">{item.timestamp}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-slate-300">
                      <td colSpan={10} className="p-6">
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
            </div>
            {/* 📄 Pagination Controls */}
            <div className="w-full flex justify-between items-center mt-3">
              {/* 📊 Info */}
              <span className="text-sm">
                Showing {(page - 1) * limit + 1} -{" "}
                {Math.min(page * limit, filteredData.length)} of{" "}
                {filteredData.length}
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
        </div>
      </div>
    </div>
  );
}
