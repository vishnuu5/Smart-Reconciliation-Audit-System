import {
  getAuditLogs,
  getRecordAuditTrail,
  exportAuditLogs,
} from "../services/auditService.js";

export const listAuditLogs = async (req, res) => {
  try {
    const {
      recordId,
      userId,
      action,
      source,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {
      recordId: recordId || undefined,
      userId: userId || undefined,
      action: action || undefined,
      source: source || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key],
    );

    const result = await getAuditLogs(filters, parseInt(page), parseInt(limit));

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

export const getRecordTimeline = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await getRecordAuditTrail(
      recordId,
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

export const exportAuditLog = async (req, res) => {
  try {
    const { recordId, startDate, endDate, action, source } = req.query;

    const filters = {
      recordId: recordId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      action: action || undefined,
      source: source || undefined,
    };
    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key],
    );

    const logs = await exportAuditLogs(filters);
    const csvData = convertToCSV(logs);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=audit-logs.csv");
    res.send(csvData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const convertToCSV = (logs) => {
  if (!logs || logs.length === 0) {
    return "No data";
  }

  const headers = [
    "Timestamp",
    "User",
    "Action",
    "Record ID",
    "Source",
    "Description",
  ];
  const rows = logs.map((log) => [
    new Date(log.createdAt).toISOString(),
    log.userId?.name || "System",
    log.action,
    log.recordId?.toString() || "N/A",
    log.source,
    log.description || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
};
