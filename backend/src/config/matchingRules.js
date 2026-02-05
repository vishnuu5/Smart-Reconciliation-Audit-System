export const MATCHING_RULES = {
  EXACT_MATCH: {
    name: "Exact Match",
    description: "Transaction ID + Amount must match exactly",
    fields: ["transactionId", "amount"],
    tolerance: 0,
    priority: 1,
  },
  PARTIAL_MATCH: {
    name: "Partial Match",
    description: "Reference Number matches with ±2% amount variance",
    fields: ["referenceNumber", "amount"],
    tolerance: 0.02, // 2%
    priority: 2,
  },
  DUPLICATE: {
    name: "Duplicate",
    description: "Same Transaction ID appears more than once in upload",
    fields: ["transactionId"],
    priority: 0, // Checked first
  },
};

export const MATCH_STATUS = {
  MATCHED: "Matched",
  PARTIALLY_MATCHED: "PartiallyMatched",
  NOT_MATCHED: "NotMatched",
  DUPLICATE: "Duplicate",
};

export const MANDATORY_FIELDS = [
  "transactionId",
  "amount",
  "referenceNumber",
  "date",
];

export const UPLOAD_STATUS = {
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};
export const checkExactMatch = (uploadedRecord, systemRecord) => {
  return (
    uploadedRecord.transactionId === systemRecord.transactionId &&
    uploadedRecord.amount === systemRecord.amount
  );
};

export const checkPartialMatch = (uploadedRecord, systemRecord) => {
  if (uploadedRecord.referenceNumber !== systemRecord.referenceNumber) {
    return false;
  }

  const amountDiff = Math.abs(uploadedRecord.amount - systemRecord.amount);
  const tolerance =
    uploadedRecord.amount * MATCHING_RULES.PARTIAL_MATCH.tolerance;

  return amountDiff <= tolerance;
};

export const checkDuplicate = (recordTransactionId, allRecords) => {
  return (
    allRecords.filter((r) => r.transactionId === recordTransactionId).length > 1
  );
};
