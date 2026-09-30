const {
  createBudget,
  getUserBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} = require("../services/budgetService");

function validateMonthYear(month, year) {
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  if (
    !Number.isInteger(monthNumber) ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    return false;
  }

  if (
    !Number.isInteger(yearNumber) ||
    yearNumber < 2000 ||
    yearNumber > 2100
  ) {
    return false;
  }

  return true;
}

async function addBudget(req, res) {
  try {
    const {
      category,
      amount,
      month,
      year,
    } = req.body || {};

    if (
      !category ||
      amount === undefined ||
      amount === null ||
      month === undefined ||
      year === undefined
    ) {
      return res.status(400).json({
        message:
          "Category, amount, month and year are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    if (!validateMonthYear(month, year)) {
      return res.status(400).json({
        message: "Invalid month or year",
      });
    }

    const budget = await createBudget(
      req.user.userId,
      category,
      amount,
      month,
      year
    );

    return res.status(201).json({
      message: "Budget added successfully",
      budget,
    });
  } catch (error) {
    console.error("Add budget error:", error);

    if (
      error.message ===
      "Budget already exists for this category and month"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to add budget",
    });
  }
}

async function getBudgets(req, res) {
  try {
    const { month, year } = req.query;

    if (
      (month !== undefined && year === undefined) ||
      (month === undefined && year !== undefined)
    ) {
      return res.status(400).json({
        message: "Month and year must be provided together",
      });
    }

    if (
      month !== undefined &&
      year !== undefined &&
      !validateMonthYear(month, year)
    ) {
      return res.status(400).json({
        message: "Invalid month or year",
      });
    }

    const budgets = await getUserBudgets(
      req.user.userId,
      month,
      year
    );

    return res.status(200).json({
      message: "Budgets fetched successfully",
      budgets,
    });
  } catch (error) {
    console.error("Get budgets error:", error);

    return res.status(500).json({
      message: "Failed to fetch budgets",
    });
  }
}

async function getBudget(req, res) {
  try {
    const budget = await getBudgetById(
      req.user.userId,
      req.params.id
    );

    return res.status(200).json({
      message: "Budget fetched successfully",
      budget,
    });
  } catch (error) {
    console.error("Get budget error:", error);

    if (error.message === "Budget not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch budget",
    });
  }
}

async function editBudget(req, res) {
  try {
    const {
      category,
      amount,
      month,
      year,
    } = req.body || {};

    if (
      !category ||
      amount === undefined ||
      amount === null ||
      month === undefined ||
      year === undefined
    ) {
      return res.status(400).json({
        message:
          "Category, amount, month and year are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    if (!validateMonthYear(month, year)) {
      return res.status(400).json({
        message: "Invalid month or year",
      });
    }

    const budget = await updateBudget(
      req.user.userId,
      req.params.id,
      category,
      amount,
      month,
      year
    );

    return res.status(200).json({
      message: "Budget updated successfully",
      budget,
    });
  } catch (error) {
    console.error("Update budget error:", error);

    if (
      error.message === "Budget not found" ||
      error.message ===
        "Budget already exists for this category and month"
    ) {
      return res.status(
        error.message === "Budget not found"
          ? 404
          : 409
      ).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update budget",
    });
  }
}

async function removeBudget(req, res) {
  try {
    await deleteBudget(
      req.user.userId,
      req.params.id
    );

    return res.status(200).json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error);

    if (error.message === "Budget not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to delete budget",
    });
  }
}

module.exports = {
  addBudget,
  getBudgets,
  getBudget,
  editBudget,
  removeBudget,
};
