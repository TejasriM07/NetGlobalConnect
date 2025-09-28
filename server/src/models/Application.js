 
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPosting', // Reference to a JobPosting model (You'll need to create this)
        required: true,
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'REVIEWED', 'REJECTED', 'OFFERED'],
        default: 'PENDING',
    },
    coverLetter: {
        type: String,
        trim: true,
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

// Ensure a user can only apply to a job once
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);