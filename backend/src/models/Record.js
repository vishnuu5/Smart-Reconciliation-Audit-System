import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    uploadJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadJob",
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      index: true,
    },
    referenceNumber: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    uploadedData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    systemData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);
// Compound index
recordSchema.index({ uploadJobId: 1, transactionId: 1 });
recordSchema.index({ uploadJobId: 1, referenceNumber: 1 });

export default mongoose.model("Record", recordSchema);
