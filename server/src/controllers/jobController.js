const Job = require("../models/Job");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// Employee: Post a job
exports.postJob = async (req, res) => {
  try {
    const { title, description, skills } = req.body;

    const job = await Job.create({
      postedBy: req.user._id,
      title,
      description,
      skills,
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// List all jobs
exports.listJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "name email");
    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// JobSeeker: Apply to job
exports.applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate("postedBy", "name");
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });

    // Check if already applied
    if (job.applicants.includes(req.user._id)) {
      return res
        .status(400)
        .json({ success: false, message: "Already applied to this job" });
    }

    job.applicants.push(req.user._id);
    await job.save();

    // Create notification for job poster
    await createNotification({
      recipient: job.postedBy._id,
      sender: req.user._id,
      type: "job_application",
      message: `${req.user.name} applied to your job: "${job.title}"`,
      relatedJob: job._id,
    });

    res
      .status(200)
      .json({ success: true, message: "Applied successfully", job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin or Employee: Get applicants for a specific job
exports.getApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate(
      "applicants",
      "name email role bio skills experience education profilePic"
    );

    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });

    // Employee can only see their own jobs
    if (req.user.role === "Employee" && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only view applicants for your jobs" });
    }

    res.status(200).json({
      success: true,
      job: {
        title: job.title,
        description: job.description,
        applicants: job.applicants,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
