import UploadJob from "../models/UploadJob.js";
import Record from "../models/Record.js";
import AuditLog from "../models/AuditLog.js";
import {
  calculateFileHash,
  parseFile,
  extractFieldNames,
} from "./fileProcessor.js";
import {
  UPLOAD_STATUS,
  AUDIT_ACTIONS,
  AUDIT_SOURCES,
} from "../config/constants.js";
import { reconcileRecords } from "./reconciliationService.js";

export const createUploadJob = async (userId, fileName, filePath, fileType) => {
  try {
    console.log("Creating upload job:", {
      userId,
      fileName,
      filePath,
      fileType,
    });

    // Calculate file hash for idempotency
    const fullPath = filePath.startsWith("/")
      ? filePath
      : `${process.cwd()}/${filePath}`;
    console.log("Full file path:", fullPath);

    const fileHash = calculateFileHash(fullPath);
    console.log("File hash calculated:", fileHash);
    const existingJob = await UploadJob.findOne({ fileHash });
    if (existingJob) {
      return {
        success: false,
        message: "This file has already been processed",
        existingJobId: existingJob._id,
      };
    }
    console.log("Starting file parsing...");
    const fileData = await parseFile(fullPath, fileType);
    console.log("File parsed successfully, rows:", fileData.length);

    if (!fileData || fileData.length === 0) {
      throw new Error("File is empty");
    }
    const columnNames = extractFieldNames(fileData);
    console.log("Column names extracted:", columnNames);
    const uploadJob = await UploadJob.create({
      userId,
      fileName,
      fileHash,
      status: UPLOAD_STATUS.PROCESSING,
      totalRecords: fileData.length,
      columnMapping: {
        availableColumns: columnNames,
        mapping: {},
      },
    });

    console.log("Upload job created in DB:", uploadJob._id);

    // Process file asynchronously
    processUploadAsync(uploadJob._id, fileData);

    return {
      success: true,
      uploadJobId: uploadJob._id,
      totalRecords: fileData.length,
      availableColumns: columnNames,
    };
  } catch (error) {
    console.error("Upload creation error:", error);
    throw new Error(`Upload creation failed: ${error.message}`);
  }
};

const processUploadAsync = async (uploadJobId, fileData) => {
  try {
    console.log("Processing upload async for job:", uploadJobId);
    const uploadJob = await UploadJob.findById(uploadJobId);

    if (!uploadJob) {
      console.error("Upload job not found:", uploadJobId);
      return;
    }

    console.log("Creating records for", fileData.length, "rows");

    for (let i = 0; i < fileData.length; i++) {
      const row = fileData[i];

      // Validate required fields
      if (!row || typeof row !== "object") {
        console.error("Invalid row data at index", i, row);
        continue;
      }

      await Record.create({
        uploadJobId,
        transactionId: row.transactionId || `TXN-${Date.now()}-${i}`,
        referenceNumber: row.referenceNumber || `REF-${i}`,
        amount: parseFloat(row.amount) || 0,
        date: row.date ? new Date(row.date) : new Date(),
        uploadedData: row,
      });

      uploadJob.recordsProcessed = i + 1;
      await uploadJob.save();
    }

    console.log("Running reconciliation for job:", uploadJobId);

    // Run reconciliation
    await reconcileRecords(uploadJobId);

    // Update job status
    uploadJob.status = UPLOAD_STATUS.COMPLETED;
    await uploadJob.save();

    // Audit log
    await AuditLog.create({
      recordId: null,
      userId: uploadJob.userId,
      action: AUDIT_ACTIONS.UPLOAD,
      source: AUDIT_SOURCES.SYSTEM,
      description: `Uploaded ${fileData.length} records`,
    });

    console.log("Upload processing completed for job:", uploadJobId);
  } catch (error) {
    console.error("Upload processing error:", error);
    const uploadJob = await UploadJob.findById(uploadJobId);
    if (uploadJob) {
      uploadJob.status = UPLOAD_STATUS.FAILED;
      uploadJob.error = error.message;
      await uploadJob.save();
    }
  }
};

export const updateColumnMapping = async (uploadJobId, mapping) => {
  try {
    const uploadJob = await UploadJob.findById(uploadJobId);

    if (!uploadJob) {
      throw new Error("Upload job not found");
    }

    uploadJob.columnMapping.mapping = mapping;
    await uploadJob.save();

    return uploadJob;
  } catch (error) {
    throw new Error(`Failed to update mapping: ${error.message}`);
  }
};

export const getUploadJob = async (uploadJobId) => {
  try {
    return await UploadJob.findById(uploadJobId).populate(
      "userId",
      "name email",
    );
  } catch (error) {
    throw new Error(`Failed to get upload job: ${error.message}`);
  }
};

export const getUploadJobs = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const jobs = await UploadJob.find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await UploadJob.countDocuments({ userId });

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get upload jobs: ${error.message}`);
  }
};
