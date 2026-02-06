const mongoose = require("mongoose");

const projectMemberSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["leader", "mentor", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["pending", "invited", "accepted"],
      default: "pending",
    },
    hasRated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique project-member combinations
projectMemberSchema.index({ projectId: 1, memberId: 1 }, { unique: true });

module.exports = mongoose.model("ProjectMember", projectMemberSchema);
