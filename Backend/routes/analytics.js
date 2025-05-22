const express = require("express");
const router = express.Router();
const { getAnalyticsSummary, getBudgetTracking, getCumulativeSpending } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");


router.get("/summary",protect ,getAnalyticsSummary);
router.get("/budget-tracking", protect,getBudgetTracking);
router.get("/cumulative", protect,getCumulativeSpending);


module.exports = router;
