import Record from "../models/Record.js";
import ReconciliationResult from "../models/ReconciliationResult.js";
import AuditLog from "../models/AuditLog.js";
import {
  getReconciliationStats as fetchReconciliationStats,
  getReconciliationResults,
  reconcileRecords,
} from "../services/reconciliationService.js";
import { AUDIT_ACTIONS, AUDIT_SOURCES } from "../config/constants.js";

export const getReconciliationData = async (req, res) => {
  try {
    const { uploadJobId, status, page = 1, limit = 20 } = req.query;

    if (!uploadJobId) {
      return res.status(400).json({
        success: false,
        message: "Upload job ID required",
      });
    }

    const filters = {};
    if (status) {
      filters.status = status;
    }

    const result = await getReconciliationResults(
      uploadJobId,
      filters,
      parseInt(page),
      parseInt(limit),
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReconciliationStats = async (req, res) => {
  try {
    const { uploadJobId } = req.query;

    if (!uploadJobId) {
      return res.status(400).json({
        success: false,
        message: "Upload job ID required",
      });
    }

    const stats = await fetchReconciliationStats(uploadJobId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const correctRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { correctedData } = req.body;

    if (!correctedData || typeof correctedData !== "object") {
      return res.status(400).json({
        success: false,
        message: "Corrected data required",
      });
    }

    const record = await Record.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }
    const oldValue = {
      transactionId: record.transactionId,
      amount: record.amount,
      uploadedData: record.uploadedData,
    };
    record.transactionId = correctedData.transactionId || record.transactionId;
    record.amount = correctedData.amount || record.amount;
    if (correctedData.uploadedData) {
      record.uploadedData = {
        ...record.uploadedData,
        ...correctedData.uploadedData,
      };
    }

    await record.save();

    await AuditLog.create({
      recordId,
      userId: req.user._id,
      action: AUDIT_ACTIONS.CORRECT,
      oldValue,
      newValue: {
        transactionId: record.transactionId,
        amount: record.amount,
        uploadedData: record.uploadedData,
      },
      source: AUDIT_SOURCES.MANUAL,
      description: `Record corrected by ${req.user.name}`,
    });

    res.json({
      success: true,
      message: "Record corrected successfully",
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecordDetail = async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await Record.findById(recordId);
    const reconciliationResult = await ReconciliationResult.findOne({
      recordId,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.json({
      success: true,
      data: {
        record,
        reconciliationResult,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const runReconciliation = async (req, res) => {
  try {
    const { uploadJobId } = req.body;

    if (!uploadJobId) {
      return res.status(400).json({
        success: false,
        message: "Upload job ID required",
      });
    }

    // Clear existing reconciliation results for this job
    await ReconciliationResult.deleteMany({ uploadJobId });

    // Run reconciliation
    const results = await reconcileRecords(uploadJobId);

    res.json({
      success: true,
      message: "Reconciliation completed",
      data: {
        resultsProcessed: results.length,
        uploadJobId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
