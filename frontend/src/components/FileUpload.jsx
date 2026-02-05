import React, { useState, useRef } from "react";
import { uploadAPI } from "../services/api";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only CSV and Excel files are allowed");
      return;
    }

    if (selectedFile.size > 52428800) {
      setError("File size exceeds 50MB limit");
      return;
    }

    setFile(selectedFile);
    setError(null);
    await generatePreview(selectedFile);
  };

  const generatePreview = async (file) => {
    try {
      const text = await file.text();
      const rows = text.split("\n").slice(0, 20);

      const parsed = rows.map((row) =>
        row.split(",").map((cell) => cell.trim()),
      );

      setPreview(parsed);
    } catch (err) {
      console.error("Preview generation error:", err);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await uploadAPI.upload(file);
      setSuccess(
        `File uploaded successfully! Job ID: ${response.data.data.uploadJobId}`,
      );
      setFile(null);
      setPreview([]);
      fileInputRef.current.value = "";

      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div
        className="card border-2 border-dashed border-primary p-6 sm:p-8 
             cursor-pointer hover:bg-light transition duration-200
             flex flex-col items-center justify-center text-center"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto mb-3 sm:mb-4 text-primary" size={48} />
        <h3 className="text-lg sm:text-xl font-semibold mb-2">
          Upload CSV or Excel File
        </h3>
        <p className="text-gray-600 text-sm sm:text-base mb-4">
          Click to select or drag and drop
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />
        {file && (
          <p className="text-primary font-semibold text-sm sm:text-base">
            {file.name}
          </p>
        )}
      </div>
      {error && (
        <div className="flex gap-3 p-3 sm:p-4 bg-red-50 text-danger rounded-lg text-sm sm:text-base">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex gap-3 p-3 sm:p-4 bg-green-50 text-secondary rounded-lg text-sm sm:text-base">
          <CheckCircle size={20} className="shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {preview.length > 0 && (
        <div className="card p-4 sm:p-6 space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">
            Preview (First 20 rows)
          </h3>
          <div className="table-responsive -mx-4 sm:-mx-6">
            <div className="inline-block min-w-full">
              <table className="table text-sm">
                <thead>
                  <tr>
                    {preview[0].map((header, idx) => (
                      <th key={idx} className="px-3 sm:px-4 py-2">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(1).map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-3 sm:px-4 py-2 truncate text-xs sm:text-sm"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base"
      >
        {loading ? "Uploading..." : "Upload File"}
      </button>
    </div>
  );
};

export default FileUpload;
