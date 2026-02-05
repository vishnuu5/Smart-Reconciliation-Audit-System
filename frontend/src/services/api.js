import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (email, password, name, role) =>
    api.post("/auth/register", { email, password, name, role }),
  login: (email, password) => api.post("/auth/login", { email, password }),
  getProfile: () => api.get("/auth/profile"),
  logout: () => api.post("/auth/logout"),
};

export const uploadAPI = {
  upload: (file, columnMapping) => {
    const formData = new FormData();
    formData.append("file", file);
    if (columnMapping) {
      formData.append("columnMapping", JSON.stringify(columnMapping));
    }
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getUploadStatus: (jobId) => api.get(`/upload/${jobId}`),
  listUploads: (page = 1, limit = 20) =>
    api.get("/upload", { params: { page, limit } }),
  mapColumns: (jobId, mapping) =>
    api.post(`/upload/${jobId}/map-columns`, { mapping }),
};

export const reconciliationAPI = {
  getResults: (uploadJobId, status, page = 1, limit = 20) =>
    api.get("/reconciliation", {
      params: { uploadJobId, status, page, limit },
    }),
  getStats: (uploadJobId) =>
    api.get("/reconciliation/stats", { params: { uploadJobId } }),
  getRecordDetail: (recordId) => api.get(`/reconciliation/${recordId}`),
  correctRecord: (recordId, correctedData) =>
    api.put(`/reconciliation/${recordId}`, { correctedData }),
};

export const auditAPI = {
  listLogs: (filters, page = 1, limit = 20) =>
    api.get("/audit", { params: { ...filters, page, limit } }),
  getRecordTimeline: (recordId, page = 1, limit = 50) =>
    api.get(`/audit/${recordId}`, { params: { page, limit } }),
  exportLogs: (filters) =>
    api.get("/audit/export", {
      params: filters,
      responseType: "blob",
    }),
};

export const dashboardAPI = {
  getSummary: (uploadJobId, startDate, endDate) =>
    api.get("/dashboard/summary", {
      params: { uploadJobId, startDate, endDate },
    }),
  getFilterOptions: () => api.get("/dashboard/filters"),
  getChartData: (uploadJobId) =>
    api.get("/dashboard/chart", { params: { uploadJobId } }),
};

export default api;
