const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    interest: {
      type: String,
    },
    otherInterest: {
      type: String,
    },
    otpCode: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
