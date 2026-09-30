const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  addExpense,
  getUserExpenses,
  editExpense,
  removeExpense,
} = require("../controllers/expenseController");

const router = express.Router();

router.post("/", authMiddleware, addExpense);

router.get("/", authMiddleware, getUserExpenses);

router.put("/:id", authMiddleware, editExpense);

router.delete("/:id", authMiddleware, removeExpense);

module.exports = router;