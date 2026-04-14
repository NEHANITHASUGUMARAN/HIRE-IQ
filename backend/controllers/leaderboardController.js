import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @desc    Get Global Ranking of all Students sorted natively by highest aggregated totalScore
// @route   GET /api/leaderboard
// @access  Public
const getGlobalLeaderboard = asyncHandler(async (req, res) => {
    // Only fetch students. Exclude recruiters.
    const topCandidates = await User.find({ accountRole: 'student', totalScore: { $gt: 0 } })
        .sort({ totalScore: -1 })
        .limit(100)
        .select('-password -__v');
        
    res.status(200).json(topCandidates);
});

// @desc    Administer score bump safely into User object. Typically fired securely when Session completes.
// @route   PUT /api/leaderboard/increment
// @access  Private (Student itself via Backend loop)
const incrementScore = asyncHandler(async (req, res) => {
    const { pointsAdded } = req.body;
    
    if(!pointsAdded || pointsAdded <= 0){
        res.status(400);
        throw new Error("Invalid score increment");
    }

    const user = await User.findById(req.user._id);
    if(user){
        user.totalScore = (user.totalScore || 0) + pointsAdded;
        await user.save();
        res.status(200).json({ totalScore: user.totalScore });
    } else {
        res.status(404);
        throw new Error("Candidate not found.");
    }
});

export { getGlobalLeaderboard, incrementScore };
