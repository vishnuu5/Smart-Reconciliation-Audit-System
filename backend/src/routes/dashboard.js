import express from "express";
import {
  getDashboardSummary,
  getFilterOptions,
  getChartData,
} from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.get("/summary", getDashboardSummary);
router.get("/filters", getFilterOptions);
router.get("/chart", getChartData);

export default router;
