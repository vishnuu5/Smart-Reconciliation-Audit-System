import UploadJob from "../models/UploadJob.js";
import ReconciliationResult from "../models/ReconciliationResult.js";
import Record from "../models/Record.js";
import { MATCH_STATUS, UPLOAD_STATUS } from "../config/constants.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const { uploadJobId, startDate, endDate } = req.query;

    const query = {};

    if (uploadJobId) {
      query._id = uploadJobId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const uploadJobs = await UploadJob.find(query);

    let totalRecords = 0;
    let matchedRecords = 0;
    let unmatchedRecords = 0;
    let partiallyMatchedRecords = 0;
    let duplicateRecords = 0;

    for (const job of uploadJobs) {
      const recordCount = await Record.countDocuments({
        uploadJobId: job._id,
      });
      totalRecords += recordCount;

      const matchedCount = await ReconciliationResult.countDocuments({
        uploadJobId: job._id,
        status: MATCH_STATUS.MATCHED,
      });
      matchedRecords += matchedCount;

      const unmatchedCount = await ReconciliationResult.countDocuments({
        uploadJobId: job._id,
        status: MATCH_STATUS.NOT_MATCHED,
      });
      unmatchedRecords += unmatchedCount;

      const partialCount = await ReconciliationResult.countDocuments({
        uploadJobId: job._id,
        status: MATCH_STATUS.PARTIALLY_MATCHED,
      });
      partiallyMatchedRecords += partialCount;

      const duplicateCount = await ReconciliationResult.countDocuments({
        uploadJobId: job._id,
        status: MATCH_STATUS.DUPLICATE,
      });
      duplicateRecords += duplicateCount;
    }

    const accuracy =
      totalRecords > 0
        ? (
            ((matchedRecords + partiallyMatchedRecords * 0.5) / totalRecords) *
            100
          ).toFixed(2)
        : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalRecords,
          matchedRecords,
          unmatchedRecords,
          partiallyMatchedRecords,
          duplicateRecords,
          accuracy,
        },
        uploadJobs: uploadJobs.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    const statuses = Object.values(MATCH_STATUS);
    const uploadStatuses = Object.values(UPLOAD_STATUS);
    const uploads = await UploadJob.find().populate("userId", "name email");
    const uploadedBy = [...new Set(uploads.map((u) => u.userId))];
    const formattedUploads = uploads.map((u) => ({
      id: u._id,
      name: u.fileName,
      createdAt: u.createdAt,
    }));

    res.json({
      success: true,
      data: {
        matchStatus: statuses,
        uploadStatus: uploadStatuses,
        uploadedBy,
        uploads: formattedUploads,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChartData = async (req, res) => {
  try {
    const { uploadJobId } = req.query;

    if (!uploadJobId) {
      return res.status(400).json({
        success: false,
        message: "Upload job ID required",
      });
    }

    const results = await ReconciliationResult.find({ uploadJobId });

    const statusCounts = {
      [MATCH_STATUS.MATCHED]: 0,
      [MATCH_STATUS.PARTIALLY_MATCHED]: 0,
      [MATCH_STATUS.NOT_MATCHED]: 0,
      [MATCH_STATUS.DUPLICATE]: 0,
    };

    results.forEach((result) => {
      statusCounts[result.status]++;
    });

    const chartData = [
      {
        name: "Matched",
        value: statusCounts[MATCH_STATUS.MATCHED],
        percentage: (
          (statusCounts[MATCH_STATUS.MATCHED] / results.length) *
          100
        ).toFixed(2),
      },
      {
        name: "Partially Matched",
        value: statusCounts[MATCH_STATUS.PARTIALLY_MATCHED],
        percentage: (
          (statusCounts[MATCH_STATUS.PARTIALLY_MATCHED] / results.length) *
          100
        ).toFixed(2),
      },
      {
        name: "Not Matched",
        value: statusCounts[MATCH_STATUS.NOT_MATCHED],
        percentage: (
          (statusCounts[MATCH_STATUS.NOT_MATCHED] / results.length) *
          100
        ).toFixed(2),
      },
      {
        name: "Duplicates",
        value: statusCounts[MATCH_STATUS.DUPLICATE],
        percentage: (
          (statusCounts[MATCH_STATUS.DUPLICATE] / results.length) *
          100
        ).toFixed(2),
      },
    ];

    res.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
