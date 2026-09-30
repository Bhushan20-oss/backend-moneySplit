const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  addIncome,
  getIncomes,
  getIncome,
  editIncome,
  removeIncome,
} = require("../controllers/incomeController");

const router = express.Router();

// Add income
router.post("/", authMiddleware, addIncome);

// Get all income
router.get("/", authMiddleware, getIncomes);

// Get single income
router.get("/:id", authMiddleware, getIncome);

// Update income
router.put("/:id", authMiddleware, editIncome);

// Delete income
router.delete("/:id", authMiddleware, removeIncome);

module.exports = router;