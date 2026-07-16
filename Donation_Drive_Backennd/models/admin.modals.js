import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Admin full name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      match: [/^[6-9]\d{9}$/, "Please enter a valid phone number"],
    },

    profileImage: {
      type: String,  //here, we have used string aswe will use the cloudinary url in this.
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },

    refreshToken: {
      type: String,
      default: "",
      select: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
    type: Date,
    default: null
},

    resetPasswordOtp: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordOtpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;