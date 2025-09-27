const asyncHandler = require('../middlewares/asyncHandler');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Employee: Can post jobs
exports.createJob = asyncHandler(async (req, res) => {
  const { title, description, company } = req.body;

  const job = await Job.create({
    title,
    description,
    company,
    postedBy: req.user._id, // employee user
  });

  res.status(201).json(job);
});

// Jobseeker: Can apply for jobs
exports.applyForJob = asyncHandler(async (req, res) => {
  const { coverLetter } = req.body;
  const jobId = req.params.id;

  // Check if already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    jobseeker: req.user._id,
  });

  if (existingApplication) {
    return res.status(400).json({ message: 'You have already applied for this job.' });
  }

  const application = await Application.create({
    job: jobId,
    jobseeker: req.user._id,
    coverLetter,
  });

  res.status(201).json({ message: 'Application submitted successfully', application });
});

// Employee: Manage applications
exports.manageApplications = asyncHandler(async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.jobId,
    postedBy: req.user._id, // only owner can see
  });

  if (!job) {
    return res.status(404).json({ message: 'Job not found or unauthorized.' });
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate('jobseeker', 'username email'); // fetch jobseeker details

  res.status(200).json({ jobTitle: job.title, applications });
});

// ✅ FIX: General: View jobs
exports.getJobs = asyncHandler(async (req, res) => {
  let jobs;

  if (req.user && req.user.role === 'Employee') {
    // Employees see their own jobs
    jobs = await Job.find({ postedBy: req.user._id });
  } else {
    // JobSeekers or others see all jobs
    jobs = await Job.find();
  }

  res.status(200).json({ count: jobs.length, jobs });
});
