const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    goals: {
      type: String,
    },
    motivation: {
      type: String,
    },
    timeline: {
      type: Number,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    maxMembers: {
      type: Number,
      default: 8,
    },
    projectImage: {
      type: String,
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
