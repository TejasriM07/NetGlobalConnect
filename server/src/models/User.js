const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    from: Date,
    to: Date,
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    school: String,
    degree: String,
    from: Date,
    to: Date,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    bio: { type: String, default: "" },
    profilePic: {
      url: String,
      publicId: String,
    },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [String],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    role: {
      type: String,
      enum: ["Admin", "JobSeeker", "Employee"],
      default: "JobSeeker",
    },
    googleId: { type: String },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
