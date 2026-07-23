import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
      index: true,
    },

    donorName: {
      type: String,
      required: true,
      trim: true,
    },

    campaignName: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    donationDate: {
      type: Date,
      required: true,
    },

    certificateUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    verificationUrl: {
      type: String,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    viewCount: {
      type: Number,
      default: 0,
    },
    displayCertificateNo: {
    type: String,
    required: true,
    unique: true,
    index: true,
},

    lastViewedAt: {
      type: Date,
      default: null,
    },

    ipAddresses: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ donation: 1, createdAt: -1 });
certificateSchema.index({ donorName: 1 });

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
