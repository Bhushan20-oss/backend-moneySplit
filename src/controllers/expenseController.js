const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../services/expenseService");

async function addExpense(req, res) {
  try {
    const {
      amount,
      category,
      description,
      expenseDate,
    } = req.body || {};

    if (!amount || !category || !expenseDate) {
      return res.status(400).json({
        message: "Amount, category and expense date are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const expense = await createExpense(
      req.user.userId,
      {
        amount,
        category,
        description,
        expenseDate,
      }
    );

    res.status(201).json({
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    console.error("Add expense error:", error);

    res.status(500).json({
      message: "Failed to add expense",
    });
  }
}

async function getUserExpenses(req, res) {
  try {
    const expenses = await getExpenses(req.user.userId);

    res.status(200).json({
      message: "Expenses fetched successfully",
      expenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    res.status(500).json({
      message: "Failed to fetch expenses",
    });
  }
}

async function editExpense(req, res) {
  try {
    const { id } = req.params;

    const {
      amount,
      category,
      description,
      expenseDate,
    } = req.body || {};

    if (!amount || !category || !expenseDate) {
      return res.status(400).json({
        message: "Amount, category and expense date are required",
      });
    }

    const expense = await updateExpense(
      req.user.userId,
      id,
      {
        amount,
        category,
        description,
        expenseDate,
      }
    );

    res.status(200).json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error("Update expense error:", error);

    if (error.message === "Expense not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to update expense",
    });
  }
}

async function removeExpense(req, res) {
  try {
    const { id } = req.params;

    await deleteExpense(req.user.userId, id);

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);

    if (error.message === "Expense not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to delete expense",
    });
  }
}

module.exports = {
  addExpense,
  getUserExpenses,
  editExpense,
  removeExpense,
};