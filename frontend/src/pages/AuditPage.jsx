import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AuditTimeline from "../components/AuditTimeline";
import { auditAPI } from "../services/api";
import { Download } from "lucide-react";

const AuditPage = () => {
  const [recordId, setRecordId] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("");
  const [source, setSource] = useState("");

  useEffect(() => {
    if (!recordId) {
      loadAllAuditLogs();
    }
  }, [page, action, source]);

  const loadAllAuditLogs = async () => {
    setLoading(true);
    try {
      const filters = {
        action: action || undefined,
        source: source || undefined,
      };
      const response = await auditAPI.listLogs(filters, page, 20);
      setAuditLogs(response.data.data.logs || []);
      setTotalPages(response.data.data.pagination.pages || 1);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await auditAPI.exportLogs({});
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "audit-logs.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error exporting logs:", error);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-dark">
            Audit Logs
          </h1>
          <button
            onClick={handleExport}
            className="btn btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center text-sm sm:text-base"
          >
            <Download size={18} />
            Export
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="card p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Record ID
              </label>
              <input
                type="text"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                placeholder="Filter by record ID"
                className="input-field w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Action</label>
              <select
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  setPage(1);
                }}
                className="input-field w-full text-sm"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="CORRECT">Correct</option>
                <option value="UPLOAD">Upload</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Source</label>
              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setPage(1);
                }}
                className="input-field w-full text-sm"
              >
                <option value="">All Sources</option>
                <option value="Manual">Manual</option>
                <option value="Auto">Auto</option>
                <option value="System">System</option>
              </select>
            </div>
          </div>
          {recordId && (
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                Timeline for Record {recordId}
              </h2>
              <AuditTimeline recordId={recordId} />
            </div>
          )}
          {!recordId && (
            <div className="card p-0 sm:p-0 overflow-hidden">
              {loading ? (
                <div className="text-center py-12 p-4 sm:p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 sm:py-12 p-4 sm:p-8 text-gray-500">
                  No audit logs found
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table w-full text-xs sm:text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 sm:px-4 py-3 text-left">
                            Timestamp
                          </th>
                          <th className="px-3 sm:px-4 py-3 text-left">User</th>
                          <th className="px-3 sm:px-4 py-3 text-left">
                            Action
                          </th>
                          <th className="px-3 sm:px-4 py-3 text-left">
                            Source
                          </th>
                          <th className="px-3 sm:px-4 py-3 text-left">
                            Record ID
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {auditLogs.map((log) => (
                          <tr
                            key={log._id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                              {log.userId?.name || "System"}
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                              <span className="badge badge-info text-xs inline-block">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                              {log.source}
                            </td>
                            <td className="px-3 sm:px-4 py-3 truncate text-xs font-mono">
                              {log.recordId?._id || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-4 pt-4 border-t px-4 sm:px-6 py-4">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="btn btn-outline disabled:opacity-50 w-full sm:w-auto text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="btn btn-outline disabled:opacity-50 w-full sm:w-auto text-sm"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuditPage;
