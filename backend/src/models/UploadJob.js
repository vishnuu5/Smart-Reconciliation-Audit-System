import mongoose from "mongoose";
import { UPLOAD_STATUS } from "../config/constants.js";

const uploadJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileHash: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(UPLOAD_STATUS),
      default: UPLOAD_STATUS.PROCESSING,
    },
    totalRecords: {
      type: Number,
      default: 0,
    },
    recordsProcessed: {
      type: Number,
      default: 0,
    },
    columnMapping: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// Index for optimization
uploadJobSchema.index({ userId: 1, createdAt: -1 });
uploadJobSchema.index({ status: 1 });
uploadJobSchema.index({ fileHash: 1 });

export default mongoose.model("UploadJob", uploadJobSchema);
