import React, { useState, useEffect } from "react";
import { auditAPI } from "../services/api";
import { useApi } from "../hooks/useApi";
import { ChevronDown } from "lucide-react";

const AuditTimeline = ({ recordId }) => {
  const [logs, setLogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const { execute: fetchTimeline } = useApi(auditAPI.getRecordTimeline);

  useEffect(() => {
    loadTimeline();
  }, [recordId, page]);

  const loadTimeline = async () => {
    if (!recordId) return;
    setLoading(true);
    try {
      const data = await fetchTimeline(recordId, page, 50);
      setLogs(data.data.logs);
    } catch (error) {
      console.error("Error loading timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "CORRECT":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No audit logs found for this record</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div key={log._id} className="card border-l-4 border-primary">
          <div
            className="cursor-pointer flex justify-between items-center"
            onClick={() =>
              setExpandedId(expandedId === log._id ? null : log._id)
            }
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span
                  className={`badge ${getActionColor(log.action)} px-3 py-1`}
                >
                  {log.action}
                </span>
                <p className="font-semibold text-dark">{log.description}</p>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {log.userId?.name || "System"} • {formatDate(log.createdAt)}
              </p>
            </div>
            <ChevronDown
              size={20}
              className={`transition-transform ${
                expandedId === log._id ? "transform rotate-180" : ""
              }`}
            />
          </div>

          {expandedId === log._id && (
            <div className="mt-4 pt-4 border-t space-y-3">
              {log.oldValue && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Old Value:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(log.oldValue, null, 2)}
                  </pre>
                </div>
              )}
              {log.newValue && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    New Value:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(log.newValue, null, 2)}
                  </pre>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Source:</p>
                  <p className="font-semibold">{log.source}</p>
                </div>
                <div>
                  <p className="text-gray-600">User:</p>
                  <p className="font-semibold">
                    {log.userId?.email || "System"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AuditTimeline;
