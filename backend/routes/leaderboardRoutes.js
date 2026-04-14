import express from "express";
import { getGlobalLeaderboard, incrementScore } from "../controllers/leaderboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getGlobalLeaderboard);
router.put("/increment", protect, incrementScore);

export default router;
