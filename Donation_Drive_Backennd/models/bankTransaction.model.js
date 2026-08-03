import mongoose, { Schema } from "mongoose";

const bankTransactionSchema = new Schema(
    {
        transactionId: {
            type: String,
            required: true,
            trim: true,
            index: true,
            unique: true,
        },

        transactionIdNormalized: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        // Integer paise avoids floating-point equality bugs during matching.
        amountInPaise: {
            type: Number,
            required: true,
            min: 1,
        },

        transactionDate: {
            type: Date,
            required: true,
        },

        senderName: {
            type: String,
            trim: true,
            default: "",
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },

        statementFileName: {
            type: String,
            required: true,
            trim: true,
        },

        uploadBatchId: {
            type: String,
            required: true,
            index: true,
        },

        reconciliationStatus: {
            type: String,
            enum: ["UNMATCHED", "PROCESSING", "MATCHED", "FAILED"],
            default: "UNMATCHED",
            index: true,
        },

        reconciliationAttempts: {
            type: Number,
            default: 0,
            min: 0,
        },

        reconciliationLastAttemptedAt: {
            type: Date,
            default: null,
        },

        reconciliationError: {
            type: String,
            default: "",
            maxlength: 1000,
        },

        emailStatus: {
            type: String,
            enum: ["NOT_SENT", "PROCESSING", "SENT", "FAILED"],
            default: "NOT_SENT",
        },

        emailLastAttemptedAt: {
            type: Date,
            default: null,
        },

        emailError: {
            type: String,
            default: "",
            maxlength: 1000,
        },

        isMatched: {
            type: Boolean,
            default: false,
        },

        matchedDonation: {
            type: Schema.Types.ObjectId,
            ref: "Donation",
            default: null,
        },

        matchedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

bankTransactionSchema.index({ reconciliationStatus: 1, createdAt: 1 });
bankTransactionSchema.index(
    { transactionIdNormalized: 1 },
    {
        unique: true,
        partialFilterExpression: { transactionIdNormalized: { $exists: true } },
    }
);
bankTransactionSchema.index({ transactionIdNormalized: 1, amountInPaise: 1 });

const BankTransaction = mongoose.model( "BankTransaction",bankTransactionSchema);
export default BankTransaction;
