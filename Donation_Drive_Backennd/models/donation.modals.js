import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    donorEmail: {
      type: String,
      required: [true, "Donor email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email",
      ],
    },

    donorPhone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    donorMessage: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: 1,
    },

    paymentMode: {
      type: String,
      required: true,
      enum: ["UPI", "Bank Transfer", "Cash", "Cheque"],
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    paymentDate: {
      type: Date,
      required: true,
    },

    screenshot: {
      url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
    },

    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Verified",
        "Rejected"
      ],
      default: "Pending",
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
      required: true,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verificationRemarks: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    certificateGenerated: {
      type: Boolean,
      default: false,
      required: true,
    },

    certificateUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;