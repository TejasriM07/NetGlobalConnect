const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const { protect, roleCheck } = require("../middlewares/authMiddleware");

// Employee can post a job
router.post("/", protect, roleCheck(["Employee"]), jobController.postJob);

// All users can get all jobs
router.get("/", protect, jobController.listJobs);

// Only JobSeekers can apply for the Job
router.post(
  "/apply/:jobId",
  protect,
  roleCheck(["JobSeeker"]),
  jobController.applyJob
);

// Admin can see who applied for which job and Employee can see only for their posted jobs
router.get(
  "/:jobId/applicants",
  protect,
  roleCheck(["Admin", "Employee"]),
  jobController.getApplicants
);

module.exports = router;
