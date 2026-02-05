import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ReconciliationView from "../components/ReconciliationView";
import { uploadAPI } from "../services/api";

const ReconciliationPage = () => {
  const [uploads, setUploads] = useState([]);
  const [selectedUploadId, setSelectedUploadId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    setLoading(true);
    try {
      const response = await uploadAPI.listUploads(1, 100);
      setUploads(response.data.data.jobs || []);
    } catch (error) {
      console.error("Error loading uploads:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-dark mb-6 sm:mb-8">
          Reconciliation
        </h1>

        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="card p-4 sm:p-6">
            <label className="block text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Select Upload to Reconcile
            </label>
            {loading ? (
              <div className="text-center py-4 sm:py-6 text-gray-600">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <p className="mt-2 text-sm">Loading uploads...</p>
              </div>
            ) : (
              <select
                value={selectedUploadId}
                onChange={(e) => setSelectedUploadId(e.target.value)}
                className="input-field w-full text-sm sm:text-base"
              >
                <option value="">Choose an upload...</option>
                {uploads.map((upload) => (
                  <option key={upload._id} value={upload._id}>
                    {upload.fileName} - {upload.totalRecords} records (
                    {upload.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedUploadId && (
            <div className="animate-fade-in">
              <ReconciliationView uploadJobId={selectedUploadId} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReconciliationPage;
