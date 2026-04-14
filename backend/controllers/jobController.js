import asyncHandler from "express-async-handler";
import Job from "../models/Job.js";

// @desc    Create a new Job Post
// @route   POST /api/jobs
// @access  Private (Recruiter only)
const createJob = asyncHandler(async (req, res) => {
    if (req.user.accountRole !== 'recruiter') {
        res.status(403);
        throw new Error("Access Denied: Only Recruiters can post jobs.");
    }

    const { title, description, requiredSkills, salaryRange, location, experienceLevel, deadline, testConfig } = req.body;

    const job = await Job.create({
        recruiterId: req.user._id,
        title,
        description,
        requiredSkills,
        salaryRange,
        location,
        experienceLevel,
        deadline,
        testConfig
    });

    res.status(201).json(job);
});

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find({ isActive: true }).populate('recruiterId', 'name email').sort({ createdAt: -1 });
    res.status(200).json(jobs);
});

// @desc    Get a single job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id).populate('recruiterId', 'name email');
    if (!job) {
        res.status(404);
        throw new Error("Job not found");
    }
    res.status(200).json(job);
});

// @desc    Get jobs created by the logged in recruiter
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter only)
const getRecruiterJobs = asyncHandler(async (req, res) => {
    if (req.user.accountRole !== 'recruiter') {
        res.status(403);
        throw new Error("Access Denied");
    }
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only)
const deleteJob = asyncHandler(async (req, res) => {
    if (req.user.accountRole !== 'recruiter') {
        res.status(403);
        throw new Error("Access Denied");
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error("Job not found");
    }

    // Only allow the original recruiter to delete their job
    if (job.recruiterId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("User strictly not authorized to delete this job");
    }

    await Job.deleteOne({ _id: job._id });
    res.status(200).json({ message: 'Job successfully deleted' });
});

export { createJob, getJobs, getJobById, getRecruiterJobs, deleteJob };
