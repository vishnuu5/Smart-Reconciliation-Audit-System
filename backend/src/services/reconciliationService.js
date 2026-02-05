import Record from "../models/Record.js";
import ReconciliationResult from "../models/ReconciliationResult.js";
import {
  MATCH_STATUS,
  checkExactMatch,
  checkPartialMatch,
  checkDuplicate,
} from "../config/matchingRules.js";

const getSystemRecords = async () => {
  return [
    {
      transactionId: "TXN001",
      referenceNumber: "REF001",
      amount: 1000.0,
      date: new Date("2024-01-01"),
    },
    {
      transactionId: "TXN002",
      referenceNumber: "REF002",
      amount: 2500.5,
      date: new Date("2024-01-02"),
    },
    {
      transactionId: "TXN003",
      referenceNumber: "REF003",
      amount: 500.25,
      date: new Date("2024-01-03"),
    },
    {
      transactionId: "TXN004",
      referenceNumber: "REF004",
      amount: 7500.0,
      date: new Date("2024-01-04"),
    },
    {
      transactionId: "TXN005",
      referenceNumber: "REF005",
      amount: 300.75,
      date: new Date("2024-01-05"),
    },
    {
      transactionId: "TXN-1001",
      referenceNumber: "REF-ABC-001",
      amount: 150.5,
      date: new Date("2023-01-15"),
      description: "Payment for Services",
    },
    {
      transactionId: "TXN-1002",
      referenceNumber: "REF-ABC-002",
      amount: 2500.0, // Exact match
      date: new Date("2023-01-16"),
      description: "Monthly Retainer",
    },
    {
      transactionId: "TXN-1004",
      referenceNumber: "REF-ABC-004",
      amount: 1200.0, // Exact match
      date: new Date("2023-01-18"),
      description: "Consulting Fee",
    },
    {
      transactionId: "TXN-1005",
      referenceNumber: "REF-ABC-005",
      amount: 300.0, // Exact match
      date: new Date("2023-01-19"),
      description: "Software License",
    },
    // Partial match case (different amount)
    {
      transactionId: "TXN-1006",
      referenceNumber: "REF-ABC-006",
      amount: 99.99,
      date: new Date("2023-01-20"),
      description: "Partial Match Test",
    },
  ];
};

export const reconcileRecords = async (uploadJobId) => {
  try {
    const records = await Record.find({ uploadJobId });
    const systemRecords = await getSystemRecords();

    const reconciliationResults = [];

    // Check for duplicates first
    const transactionIds = new Map();
    records.forEach((record) => {
      if (!transactionIds.has(record.transactionId)) {
        transactionIds.set(record.transactionId, []);
      }
      transactionIds.get(record.transactionId).push(record._id);
    });

    for (const record of records) {
      let status = MATCH_STATUS.NOT_MATCHED;
      let matchedFields = [];
      let mismatchedFields = [];
      let confidence = 0;
      let systemRecord = null;
      if (transactionIds.get(record.transactionId).length > 1) {
        status = MATCH_STATUS.DUPLICATE;
        confidence = 0;
      } else {
        const exactMatchRecord = systemRecords.find((sr) =>
          checkExactMatch(record, sr),
        );

        if (exactMatchRecord) {
          status = MATCH_STATUS.MATCHED;
          matchedFields = ["transactionId", "amount"];
          confidence = 100;
          systemRecord = exactMatchRecord;
        } else {
          const partialMatchRecord = systemRecords.find((sr) =>
            checkPartialMatch(record, sr),
          );

          if (partialMatchRecord) {
            status = MATCH_STATUS.PARTIALLY_MATCHED;
            matchedFields = ["referenceNumber"];
            confidence = 75;
            systemRecord = partialMatchRecord;

            if (record.amount !== partialMatchRecord.amount) {
              mismatchedFields.push({
                fieldName: "amount",
                uploadedValue: record.amount,
                systemValue: partialMatchRecord.amount,
              });
            }
          }
        }
      }

      const result = await ReconciliationResult.create({
        recordId: record._id,
        uploadJobId,
        status,
        matchedFields,
        mismatchedFields,
        confidence,
        systemRecord,
      });

      reconciliationResults.push(result);
    }

    return reconciliationResults;
  } catch (error) {
    throw new Error(`Reconciliation failed: ${error.message}`);
  }
};

export const getReconciliationStats = async (uploadJobId) => {
  try {
    const results = await ReconciliationResult.find({ uploadJobId });

    const stats = {
      total: results.length,
      matched: results.filter((r) => r.status === MATCH_STATUS.MATCHED).length,
      partiallyMatched: results.filter(
        (r) => r.status === MATCH_STATUS.PARTIALLY_MATCHED,
      ).length,
      notMatched: results.filter((r) => r.status === MATCH_STATUS.NOT_MATCHED)
        .length,
      duplicates: results.filter((r) => r.status === MATCH_STATUS.DUPLICATE)
        .length,
      accuracy:
        results.length > 0
          ? (
              (results.filter((r) => r.status === MATCH_STATUS.MATCHED).length /
                results.length) *
              100
            ).toFixed(2)
          : 0,
    };

    return stats;
  } catch (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }
};

export const getReconciliationResults = async (
  uploadJobId,
  filters = {},
  page = 1,
  limit = 20,
) => {
  try {
    const query = { uploadJobId };

    if (filters.status) {
      query.status = filters.status;
    }

    const skip = (page - 1) * limit;
    const results = await ReconciliationResult.find(query)
      .populate("recordId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ReconciliationResult.countDocuments(query);

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get results: ${error.message}`);
  }
};
