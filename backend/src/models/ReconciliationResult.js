import mongoose from "mongoose";
import { MATCH_STATUS } from "../config/constants.js";

const reconciliationResultSchema = new mongoose.Schema(
  {
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Record",
      required: true,
      unique: true,
    },
    uploadJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadJob",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(MATCH_STATUS),
      required: true,
    },
    matchedFields: [String],
    mismatchedFields: [
      {
        fieldName: String,
        uploadedValue: mongoose.Schema.Types.Mixed,
        systemValue: mongoose.Schema.Types.Mixed,
      },
    ],
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    systemRecord: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);
reconciliationResultSchema.index({ uploadJobId: 1, status: 1 });
reconciliationResultSchema.index({ status: 1 });

export default mongoose.model(
  "ReconciliationResult",
  reconciliationResultSchema,
);
