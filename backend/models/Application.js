import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Job"
    },
    resumeAiSummary: {
        skillsFound: [String],
        experienceMatch: Number,
        feedback: String
    },
    sessionResultId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session"
    },
    overallScore: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Tested', 'Shortlisted', 'Rejected'],
        default: 'Pending'
    },
    scheduledDate: {
        type: Date
    },
    resumeUrl: {
        type: String
    }
}, { timestamps: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
