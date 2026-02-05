import mongoose from "mongoose";
import { AUDIT_SOURCES, AUDIT_ACTIONS } from "../config/constants.js";

const auditLogSchema = new mongoose.Schema(
  {
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Record",
      required: false,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    source: {
      type: String,
      enum: Object.values(AUDIT_SOURCES),
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Make immutable - prevent updates after creation
auditLogSchema.pre("findByIdAndUpdate", function (next) {
  next(new Error("Audit logs are immutable and cannot be modified"));
});

auditLogSchema.pre("updateOne", function (next) {
  next(new Error("Audit logs are immutable and cannot be modified"));
});
auditLogSchema.index({ recordId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

export default mongoose.model("AuditLog", auditLogSchema);
