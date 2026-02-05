import React, { useState } from "react";
import Navbar from "../components/Navbar";
import FileUpload from "../components/FileUpload";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {
  const navigate = useNavigate();
  const [uploadedJobId, setUploadedJobId] = useState(null);

  const handleUploadSuccess = (data) => {
    setUploadedJobId(data.uploadJobId);
    setTimeout(() => {
      navigate("/reconciliation");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-dark mb-2">
            Upload Data
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
            Upload your CSV or Excel file for reconciliation
          </p>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
