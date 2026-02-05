import express from "express";
import {
  getReconciliationData,
  getReconciliationStats,
  correctRecord,
  getRecordDetail,
  runReconciliation,
} from "../controllers/reconciliationController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.get("/", authorize("reconcile"), getReconciliationData);
router.get("/stats", getReconciliationStats);
router.get("/:recordId", getRecordDetail);
router.put("/:recordId", authorize("reconcile"), correctRecord);
router.post("/run", authorize("reconcile"), runReconciliation);

export default router;
