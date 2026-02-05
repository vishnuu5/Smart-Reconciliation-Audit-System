import AuditLog from "../models/AuditLog.js";

export const createAuditLog = async (
  recordId,
  userId,
  action,
  oldValue,
  newValue,
  source,
  description = "",
) => {
  try {
    const auditLog = await AuditLog.create({
      recordId,
      userId,
      action,
      oldValue,
      newValue,
      source,
      description,
    });

    return auditLog;
  } catch (error) {
    throw new Error(`Failed to create audit log: ${error.message}`);
  }
};

export const getAuditLogs = async (filters = {}, page = 1, limit = 20) => {
  try {
    const query = {};

    if (filters.recordId) {
      query.recordId = filters.recordId;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    const skip = (page - 1) * limit;
    const logs = await AuditLog.find(query)
      .populate("userId", "name email")
      .populate("recordId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments(query);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get audit logs: ${error.message}`);
  }
};

export const getRecordAuditTrail = async (recordId, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;
    const logs = await AuditLog.find({ recordId })
      .populate("userId", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments({ recordId });

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get audit trail: ${error.message}`);
  }
};

export const exportAuditLogs = async (filters = {}) => {
  try {
    const query = {};

    if (filters.recordId) {
      query.recordId = filters.recordId;
    }

    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    const logs = await AuditLog.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return logs;
  } catch (error) {
    throw new Error(`Failed to export audit logs: ${error.message}`);
  }
};
