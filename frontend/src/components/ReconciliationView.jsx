import React, { useState, useEffect } from "react";
import { reconciliationAPI } from "../services/api";
import { useApi } from "../hooks/useApi";
import { CheckCircle, AlertCircle, Edit2, Save, X } from "lucide-react";

const ReconciliationView = ({ uploadJobId }) => {
  const [results, setResults] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);

  const { execute: fetchResults } = useApi(reconciliationAPI.getResults);
  const { execute: correctRecord } = useApi(reconciliationAPI.correctRecord);

  useEffect(() => {
    loadResults();
  }, [uploadJobId, selectedStatus, page]);

  const loadResults = async () => {
    if (!uploadJobId) return;
    setLoading(true);
    try {
      const data = await fetchResults(uploadJobId, selectedStatus, page, 20);
      setResults(data.data.results);
      setTotalPages(data.data.pagination.pages);
    } catch (error) {
      console.error("Error loading results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (result) => {
    setEditingId(result._id);
    setEditData({
      transactionId: result.recordId?.transactionId || "",
      amount: result.recordId?.amount || "",
    });
  };

  const handleSave = async (recordId) => {
    try {
      await correctRecord(recordId, editData);
      setEditingId(null);
      loadResults();
    } catch (error) {
      console.error("Error saving correction:", error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Matched":
        return "badge-success";
      case "PartiallyMatched":
        return "badge-warning";
      case "NotMatched":
        return "badge-error";
      case "Duplicate":
        return "badge-error";
      default:
        return "badge-info";
    }
  };

  const getStatusIcon = (status) => {
    return status === "Matched" ? (
      <CheckCircle size={18} className="text-green-600" />
    ) : (
      <AlertCircle size={18} className="text-amber-600" />
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="card p-4 sm:p-6">
        <label className="block text-sm font-semibold mb-3">
          Filter by Status
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(1);
          }}
          className="input-field w-full text-sm sm:text-base"
        >
          <option value="">All</option>
          <option value="Matched">Matched</option>
          <option value="PartiallyMatched">Partially Matched</option>
          <option value="NotMatched">Not Matched</option>
          <option value="Duplicate">Duplicate</option>
        </select>
      </div>
      <div className="card p-0 sm:p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 p-4 sm:p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 sm:py-12 p-4 sm:p-8 text-gray-500">
            No reconciliation results found
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left">
                      Transaction ID
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left">Reference #</th>
                    <th className="px-3 sm:px-4 py-3 text-left">Amount</th>
                    <th className="px-3 sm:px-4 py-3 text-left">Status</th>
                    <th className="px-3 sm:px-4 py-3 text-center">
                      Confidence
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr
                      key={result._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-3 sm:px-4 py-3">
                        {editingId === result._id ? (
                          <input
                            type="text"
                            value={editData.transactionId}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                transactionId: e.target.value,
                              })
                            }
                            className="input-field text-xs sm:text-sm w-full"
                          />
                        ) : (
                          <span className="font-mono text-xs sm:text-sm">
                            {result.recordId?.transactionId}
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                        {result.recordId?.referenceNumber}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        {editingId === result._id ? (
                          <input
                            type="number"
                            value={editData.amount}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                amount: e.target.value,
                              })
                            }
                            className="input-field text-xs sm:text-sm w-full"
                          />
                        ) : (
                          <span className="font-mono text-xs sm:text-sm">
                            ${result.recordId?.amount.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <span
                          className={`badge ${getStatusBadgeClass(result.status)} inline-flex items-center gap-1 text-xs`}
                        >
                          {getStatusIcon(result.status)}
                          <span className="hidden sm:inline">
                            {result.status}
                          </span>
                          <span className="sm:hidden">
                            {result.status?.substring(0, 3)}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm">
                        {result.confidence}%
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        {editingId === result._id ? (
                          <div className="flex gap-1 sm:gap-2 justify-center">
                            <button
                              onClick={() => handleSave(result.recordId._id)}
                              className="btn btn-primary text-xs py-1 px-2"
                              title="Save"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="btn btn-outline text-xs py-1 px-2"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(result)}
                            className="btn btn-secondary text-xs py-1 px-2"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
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
    </div>
  );
};

export default ReconciliationView;
