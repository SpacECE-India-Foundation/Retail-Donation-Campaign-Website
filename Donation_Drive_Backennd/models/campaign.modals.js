import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      required: [true, "Campaign name is required"],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    campaignDescription: {
      type: String,
      required: [true, "Campaign description is required"],
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },

    campaignBanner: {
      url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
    },

    startDate: {
      type: Date,
      required: [true, "Campaign start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "Campaign end date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be greater than start date.",
      },
    },

    campaignStatus: {
      type: String,
      enum: ["Upcoming", "Active", "Completed", "inActive"],
      default: "Upcoming",
      required: true,
    },

    campaignGoalAmt: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    campaignRaisedAmt: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    contributors: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    createdBy:{
        type: mongoose.Types.ObjectId,
        ref:"Admin",
        required:true
    }
  },
  {
    timestamps: true,
  }
);

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;