import mongoose from "mongoose";

const violationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["TAB_SWITCH", "COPY", "PASTE", "RIGHT_CLICK", "MULTIPLE_FACES", "NO_FACE", "EXIT_FULLSCREEN", "OUT_OF_BOUNDS"],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: String,
        default: ""
    }
});

const proctoringSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true,
        index: true
    },
    violations: [violationSchema],
    riskScore: {
        type: Number,
        default: 0
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ["active", "completed", "terminated"],
        default: "active"
    }
}, {
    timestamps: true
});

const ProctoringSession = mongoose.model("ProctoringSession", proctoringSessionSchema);
export default ProctoringSession;
