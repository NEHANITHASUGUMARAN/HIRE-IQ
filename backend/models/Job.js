import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requiredSkills: {
        type: [String],
        required: true
    },
    salaryRange: {
        type: String,
        default: "Not Specified"
    },
    location: {
        type: String,
        default: "Remote"
    },
    experienceLevel: {
        type: String,
        enum: ['Junior', 'Mid-Level', 'Senior', 'Any'],
        default: 'Any'
    },
    deadline: {
        type: Date
    },
    testConfig: {
       interviewType: {
            type: String,
            enum: ['oral-only', 'coding-mix', 'mcq'],
            default: 'coding-mix'
       },
       difficulty: {
            type: String,
            enum: ['Junior', 'Mid-Level', 'Senior'],
            default: 'Junior'
       },
       questionCount: {
            type: Number,
            default: 5
       }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);
export default Job;
