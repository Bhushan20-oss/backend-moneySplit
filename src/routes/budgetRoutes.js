const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  addBudget,
  getBudgets,
  getBudget,
  editBudget,
  removeBudget,
} = require("../controllers/budgetController");

const router = express.Router();

// Add budget
router.post("/", authMiddleware, addBudget);

// Get budgets
router.get("/", authMiddleware, getBudgets);

// Get single budget
router.get("/:id", authMiddleware, getBudget);

// Update budget
router.put("/:id", authMiddleware, editBudget);

// Delete budget
router.delete("/:id", authMiddleware, removeBudget);

module.exports = router;