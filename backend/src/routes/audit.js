import express from "express";
import {
  listAuditLogs,
  getRecordTimeline,
  exportAuditLog,
} from "../controllers/auditController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate);
router.get("/", listAuditLogs);
router.get("/export", exportAuditLog);
router.get("/:recordId", getRecordTimeline);

export default router;
