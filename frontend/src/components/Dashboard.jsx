import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { dashboardAPI, uploadAPI } from "../services/api";
import { useApi } from "../hooks/useApi";
import { TrendingUp, Check, AlertCircle, Copy } from "lucide-react";

const Dashboard = () => {
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(true);
  const filterOptions = []; // Declare filterOptions variable

  const { execute: fetchSummary } = useApi(dashboardAPI.getSummary);
  const { execute: fetchChartData } = useApi(dashboardAPI.getChartData);
  const { execute: fetchUploads } = useApi(uploadAPI.listUploads);

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    try {
      setUploadsLoading(true);
      const response = await fetchUploads(1, 100);
      console.log("Uploads response:", response);
      const uploadsData = response?.data?.jobs || [];
      setUploads(Array.isArray(uploadsData) ? uploadsData : []);
    } catch (error) {
      console.error("Error loading uploads:", error);
      setUploads([]);
    } finally {
      setUploadsLoading(false);
    }
  };

  const loadDashboard = async (uploadJobId) => {
    setLoading(true);
    try {
      if (uploadJobId) {
        const summaryData = await fetchSummary(uploadJobId);
        const chart = await fetchChartData(uploadJobId);
        setSummary(summaryData.data.summary);
        setChartData(chart.data);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#10B981", "#3B82F6", "#EF4444", "#F59E0B"];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-dark">Dashboard</h1>
      </div>
      <div className="card">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Select Upload to Analyze
        </h2>
        {uploadsLoading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="text-gray-600 text-sm mt-2">Loading uploads...</p>
          </div>
        ) : (
          <select
            value={selectedUpload || ""}
            onChange={(e) => {
              setSelectedUpload(e.target.value);
              if (e.target.value) loadDashboard(e.target.value);
            }}
            className="input-field w-full"
          >
            <option value="">Select an upload...</option>
            {uploads.length > 0 ? (
              uploads.map((upload) => (
                <option key={upload._id} value={upload._id}>
                  {upload.fileName} - {upload.totalRecords} records (
                  {upload.status})
                </option>
              ))
            ) : (
              <option disabled>No uploads available</option>
            )}
          </select>
        )}
      </div>

      {!selectedUpload ? (
        <div className="card text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg">
            Select an upload to view dashboard metrics
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="card text-center p-4 sm:p-6">
              <TrendingUp className="text-primary mx-auto mb-3" size={32} />
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                Total Records
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-dark mt-2">
                {summary.totalRecords}
              </p>
            </div>
            <div className="card text-center p-4 sm:p-6">
              <Check className="text-secondary mx-auto mb-3" size={32} />
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                Matched
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-secondary mt-2">
                {summary.matchedRecords}
              </p>
            </div>
            <div className="card text-center p-4 sm:p-6">
              <AlertCircle className="text-warning mx-auto mb-3" size={32} />
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                Partially Matched
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-warning mt-2">
                {summary.partiallyMatchedRecords}
              </p>
            </div>
            <div className="card text-center p-4 sm:p-6">
              <AlertCircle className="text-danger mx-auto mb-3" size={32} />
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                Not Matched
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-danger mt-2">
                {summary.unmatchedRecords}
              </p>
            </div>
            <div className="card text-center p-4 sm:p-6">
              <Copy className="text-danger mx-auto mb-3" size={32} />
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                Duplicates
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-danger mt-2">
                {summary.duplicateRecords}
              </p>
            </div>
          </div>
          <div className="card p-6 sm:p-8">
            <div className="text-center">
              <p className="text-gray-600 text-base sm:text-lg font-medium mb-3">
                Reconciliation Accuracy
              </p>
              <p className="text-5xl sm:text-6xl font-bold text-primary mb-6">
                {summary.accuracy}%
              </p>
              <div className="w-full bg-light rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${summary.accuracy}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">
                Match Distribution (Bar)
              </h3>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">
                Match Distribution (Donut)
              </h3>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
