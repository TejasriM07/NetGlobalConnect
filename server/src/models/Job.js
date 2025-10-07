const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    skills: [{ type: String }],
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    applicationDeadline: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
); // createdAt, updatedAt

module.exports = mongoose.model("Job", jobSchema);
