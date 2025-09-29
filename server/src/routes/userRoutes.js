const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { protect, roleCheck } = require('../middlewares/authMiddleware');
const {
  getProfile,
  updateProfile,
  getUserById,
  sendConnectionRequest,
} = require('../controllers/userController');

// JobSeeker/Employee Feature: Can connect with other users
router.post(
  '/:id/connect',
  protect,
  roleCheck(['JobSeeker', 'Employee']),
  sendConnectionRequest
);

// --- ADMIN CONTROL ROUTES ---
router.put(
  '/:id/suspend',
  protect,
  roleCheck(['Admin']),
  adminController.toggleUserSuspension
);

router.delete(
  '/employee/:id',
  protect,
  roleCheck(['Admin']),
  adminController.deleteEmployee
);

router.get(
  '/',
  protect,
  roleCheck(['Admin']),
  adminController.getAllUsers
);

// Current logged-in user profile
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

// Get any user by ID
router.get('/:id', protect, getUserById);

module.exports = router;