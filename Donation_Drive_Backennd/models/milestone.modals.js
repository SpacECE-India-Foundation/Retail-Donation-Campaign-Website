import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: [true, "Campaign reference is required"],
    },

    milestoneTitle: {
      type: String,
      required: [true, "Milestone title is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      required: [true, "Milestone description is required"],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: 1,
    },

    displayOrder: {
      type: Number,
      required: [true, "Display order is required"],
      min: 1,
    },

    milestoneImage: {
      url: {
        type: String,
    },
    publicId: {
        type: String,
    },
    },

    isCompleted: {
      type: Boolean,
      default: false,
      required: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Milestone = mongoose.model("Milestone", milestoneSchema);

export default Milestone;