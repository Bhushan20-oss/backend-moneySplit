const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getReport,
  getComparison,
} = require("../controllers/reportController");

const router = express.Router();

// Monthly financial report
router.get(
  "/monthly",
  authMiddleware,
  getReport
);

// Month-over-month comparison
router.get(
  "/comparison",
  authMiddleware,
  getComparison
);

module.exports = router;