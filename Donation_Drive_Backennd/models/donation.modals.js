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

    // No longer collected on the public donation form — the payment method
    // will be determined by the upcoming Cashfree/UPI/bank-statement
    // integration instead. Field kept (optional) because it's still read,
    // filtered, and exported by the admin Reports/History/Verification
    // pages and existing historical donations.
    paymentMode: {
      type: String,
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

    // No longer required at submission — the V2 UPI flow has the donor
    // self-report their UTR/transaction ID instead of uploading proof.
    // Kept optional (not deleted) because it's still displayed/exported by
    // the admin Reports/History/Verification pages when it does exist.
    screenshot: {
      url: {
        type: String,
    },
    publicId: {
        type: String,
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
    resubmissionCount: {
    type: Number,
    default: 0
},
verificationEmailSent: {
    type: Boolean,
    default: false,
},
automationAttempted:{
type:Boolean,
default:false
},
automationFailureReason:{
type:String,
default:""
}
  },
  {
    timestamps: true,
  }
);

donationSchema.index({
    campaign: 1,
    status: 1,
    createdAt: -1
});

donationSchema.index({
    campaign: 1,
    donorEmail: 1,
    createdAt: -1
});
const Donation = mongoose.model("Donation", donationSchema);

export default Donation;