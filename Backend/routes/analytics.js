import express from "express";
import { getAnalyticsSummary, getBudgetTracking, getCumulativeSpending } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, getAnalyticsSummary);
router.get("/budget-tracking", protect, getBudgetTracking);
router.get("/cumulative", protect, getCumulativeSpending);

export default router;
