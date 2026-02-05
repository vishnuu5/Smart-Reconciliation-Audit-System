import {
  createUploadJob,
  updateColumnMapping,
  getUploadJob,
  getUploadJobs,
} from "../services/uploadService.js";

export const uploadFile = async (req, res) => {
  try {
    console.log("Upload request received:", {
      file: req.file ? req.file.originalname : "No file",
      user: req.user ? req.user._id : "No user",
      body: req.body,
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { columnMapping } = req.body;

    const result = await createUploadJob(
      req.user._id,
      req.file.originalname,
      req.file.path,
      req.file.mimetype,
    );

    console.log("Upload job created:", result);

    if (!result.success) {
      return res.status(400).json(result);
    }
    if (columnMapping) {
      await updateColumnMapping(result.uploadJobId, columnMapping);
    }

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        uploadJobId: result.uploadJobId,
        totalRecords: result.totalRecords,
        availableColumns: result.availableColumns,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUploadJobStatus = async (req, res) => {
  try {
    const uploadJob = await getUploadJob(req.params.jobId);

    if (!uploadJob) {
      return res.status(404).json({
        success: false,
        message: "Upload job not found",
      });
    }
    if (
      uploadJob.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: uploadJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const listUploads = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const result = await getUploadJobs(
      req.user._id,
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

export const mapColumns = async (req, res) => {
  try {
    const { mapping } = req.body;

    if (!mapping || typeof mapping !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid column mapping",
      });
    }

    const uploadJob = await getUploadJob(req.params.jobId);

    if (!uploadJob) {
      return res.status(404).json({
        success: false,
        message: "Upload job not found",
      });
    }
    if (
      uploadJob.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updatedJob = await updateColumnMapping(req.params.jobId, mapping);

    res.json({
      success: true,
      message: "Column mapping updated",
      data: updatedJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
