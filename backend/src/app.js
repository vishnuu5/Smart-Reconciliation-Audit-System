import express from "express";
import cors from "cors";
import "express-async-errors";
import "dotenv/config";

import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import reconciliationRoutes from "./routes/reconciliation.js";
import auditRoutes from "./routes/audit.js";
import dashboardRoutes from "./routes/dashboard.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reconciliation", reconciliationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;
