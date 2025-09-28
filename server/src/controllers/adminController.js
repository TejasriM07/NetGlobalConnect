const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/User');
const Post = require('../models/Post');
const Job = require('../models/Job');


// Admin Feature: Can view all users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password'); // don’t return password
  res.status(200).json({ success: true, data: users });
});

// Admin Feature: Can block or suspend users
exports.toggleUserSuspension = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    
    // Admins cannot suspend other Admins (security measure)
    if (user.role === 'Admin') {
         return res.status(403).json({ message: 'Cannot suspend another Admin.' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();
    
    res.status(200).json({ 
        message: `${user.username} is now ${user.isSuspended ? 'SUSPENDED' : 'ACTIVE'}.`
    });
});

// Admin Feature: Can delete posts (spam/inappropriate)
exports.deletePost = asyncHandler(async (req, res) => {
    const result = await Post.findByIdAndDelete(req.params.id);
    
    if (!result) {
        return res.status(404).json({ message: 'Post not found.' });
    }
    
    res.status(200).json({ message: 'Post successfully deleted by Admin.' });
});

// Admin Feature: Can delete employees (fraudulent jobs)
exports.deleteEmployee = asyncHandler(async (req, res) => {
    const employee = await User.findById(req.params.id);

    if (!employee || employee.role !== 'Employee') {
        return res.status(400).json({ message: 'User not found or is not an Employee.' });
    }

    // Optional: Delete all jobs posted by this employee before deleting the user
    await Job.deleteMany({ postedBy: employee._id }); 
    await employee.deleteOne();
    
    res.status(200).json({ message: `Employee ${employee.username} and their jobs have been deleted.` });
});