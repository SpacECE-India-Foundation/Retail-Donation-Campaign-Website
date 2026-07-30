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

        amount: {
            type: Number,
            required: true,
            min: 0,
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


const BankTransaction = mongoose.model( "BankTransaction",bankTransactionSchema);
export default BankTransaction;