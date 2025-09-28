const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect,roleCheck } = require('../middlewares/authMiddleware');



// ✅ Employee: Create a job
router.post(
  '/',
  protect,
  roleCheck(['Employee']),
  jobController.createJob
);

// ✅ JobSeeker: Apply for a job
router.post(
  '/:id/apply',
  protect,
  roleCheck(['JobSeeker']),
  jobController.applyForJob
);

// ✅ Employee: Manage applications for a specific job
router.get(
  '/:jobId/applications',
  protect,
  roleCheck(['Employee']),
  jobController.manageApplications
);


router.get('/*', jobController.getJobs); 


module.exports = router;
