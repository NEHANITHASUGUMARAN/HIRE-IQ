import asyncHandler from "express-async-handler";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

// @desc    Create a new application for a job
// @route   POST /api/applications/:jobId
// @access  Private (Student only)
const createApplication = asyncHandler(async (req, res) => {
    if (req.user.accountRole !== 'student') {
        res.status(403);
        throw new Error("Only students can apply for jobs.");
    }

    const { jobId } = req.params;
    const { sessionResultId, scheduledDate, resumeUrl } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
        res.status(404);
        throw new Error("Job not found.");
    }

    // Check if duplicate application exists
    const existing = await Application.findOne({ candidateId: req.user._id, jobId });
    if (existing) {
        res.status(400);
        throw new Error("You have already applied for this job.");
    }

    const application = await Application.create({
        candidateId: req.user._id,
        jobId,
        sessionResultId: sessionResultId || null,
        scheduledDate: scheduledDate || null,
        resumeUrl: resumeUrl || '',
        status: sessionResultId ? 'Tested' : 'Pending'
    });

    res.status(201).json(application);
});

// @desc    Update application with Mock Test Session Result
// @route   PUT /api/applications/:id
// @access  Private
const updateApplicationResult = asyncHandler(async (req, res) => {
    const { sessionResultId, overallScore } = req.body;

    let application = await Application.findById(req.params.id);
    if (!application) {
        res.status(404);
        throw new Error("Application not found.");
    }

    application.sessionResultId = sessionResultId;
    if (overallScore !== undefined) {
        application.overallScore = overallScore;
    }
    application.status = 'Tested';

    await application.save();
    res.status(200).json(application);
});

// @desc    Get all applications for a specific job (Recruiter view)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter only)
const getJobApplications = asyncHandler(async (req, res) => {
    if (req.user.accountRole !== 'recruiter') {
        res.status(403);
        throw new Error("Access Denied");
    }

    // Verify ownership of the job
    const job = await Job.findById(req.params.jobId);
    if (!job || job.recruiterId.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error("Job not found or unauthorized.");
    }

    const applications = await Application.find({ jobId: req.params.jobId })
        .populate('candidateId', 'name email skills totalScore preferredRole')
        .populate('sessionResultId');

    res.status(200).json(applications);
});

// @desc    Update application status (Shortlist/Reject)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter only)
const updateApplicationStatus = asyncHandler(async (req, res) => {
    if (req.user.accountRole !== 'recruiter') {
        res.status(403);
        throw new Error("Access Denied");
    }

    const { status } = req.body;
    let application = await Application.findById(req.params.id);

    if (!application) {
        res.status(404);
        throw new Error("Application not found.");
    }

    application.status = status;
    await application.save();

    res.status(200).json(application);
});

// @desc    Get all active applications for the logged in student
// @route   GET /api/applications/me
// @access  Private (Student only)
const getMyApplications = asyncHandler(async (req, res) => {
    if (req.user.accountRole !== 'student') {
        res.status(403);
        throw new Error("Access Denied");
    }

    const applications = await Application.find({ candidateId: req.user._id })
        .populate('jobId', 'title description testConfig deadline')
        .populate('sessionResultId')
        .sort({ createdAt: -1 });

    res.status(200).json(applications);
});

export { createApplication, updateApplicationResult, getJobApplications, updateApplicationStatus, getMyApplications };
