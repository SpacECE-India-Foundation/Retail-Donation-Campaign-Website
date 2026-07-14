import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Message title is required"],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    purpose: {
      type: String,
      required: [true, "Message purpose is required"],
      enum: [
        "Campaign Update",
        "Donation Confirmation",
        "Donation Verification",
        "Donation Rejection",
        "Certificate",
        "Reminder",
        "Custom",
      ],
    },

    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },

    recipientEmail: {
      type: String,
      required: [true, "Recipient email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    messageDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;