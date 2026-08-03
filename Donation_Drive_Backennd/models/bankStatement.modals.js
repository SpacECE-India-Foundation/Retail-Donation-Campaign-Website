import mongoose, { Schema } from "mongoose";

const bankStatementSchema = new Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    statementDate: {
      type: Date,
      required: true,
      index: true,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    totalTransactions: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    matchedTransactions: {
      type: Number,
      default: 0,
      min: 0,
    },

    failedTransactions: {
      type: Number,
      default: 0,
      min: 0,
    },

    processingStatus: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
      ],
      default: "PENDING",
      index: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const BankStatement = mongoose.model(
  "BankStatement",
  bankStatementSchema
);

export default BankStatement;