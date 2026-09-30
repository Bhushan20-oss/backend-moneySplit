const {
  createIncome,
  getUserIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
} = require("../services/incomeService");

async function addIncome(req, res) {
  try {
    const {
      amount,
      source,
      description,
      incomeDate,
    } = req.body || {};

    if (
      amount === undefined ||
      amount === null ||
      !source ||
      !incomeDate
    ) {
      return res.status(400).json({
        message: "Amount, source and income date are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const date = new Date(incomeDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid income date",
      });
    }

    const income = await createIncome(
      req.user.userId,
      amount,
      source,
      description,
      incomeDate
    );

    return res.status(201).json({
      message: "Income added successfully",
      income,
    });
  } catch (error) {
    console.error("Add income error:", error);

    return res.status(500).json({
      message: "Failed to add income",
    });
  }
}

async function getIncomes(req, res) {
  try {
    const incomes = await getUserIncomes(
      req.user.userId
    );

    return res.status(200).json({
      message: "Income fetched successfully",
      incomes,
    });
  } catch (error) {
    console.error("Get incomes error:", error);

    return res.status(500).json({
      message: "Failed to fetch income",
    });
  }
}

async function getIncome(req, res) {
  try {
    const income = await getIncomeById(
      req.user.userId,
      req.params.id
    );

    return res.status(200).json({
      message: "Income fetched successfully",
      income,
    });
  } catch (error) {
    console.error("Get income error:", error);

    if (error.message === "Income not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch income",
    });
  }
}

async function editIncome(req, res) {
  try {
    const {
      amount,
      source,
      description,
      incomeDate,
    } = req.body || {};

    if (
      amount === undefined ||
      amount === null ||
      !source ||
      !incomeDate
    ) {
      return res.status(400).json({
        message: "Amount, source and income date are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const date = new Date(incomeDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid income date",
      });
    }

    const income = await updateIncome(
      req.user.userId,
      req.params.id,
      amount,
      source,
      description,
      incomeDate
    );

    return res.status(200).json({
      message: "Income updated successfully",
      income,
    });
  } catch (error) {
    console.error("Update income error:", error);

    if (error.message === "Income not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update income",
    });
  }
}

async function removeIncome(req, res) {
  try {
    await deleteIncome(
      req.user.userId,
      req.params.id
    );

    return res.status(200).json({
      message: "Income deleted successfully",
    });
  } catch (error) {
    console.error("Delete income error:", error);

    if (error.message === "Income not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to delete income",
    });
  }
}

module.exports = {
  addIncome,
  getIncomes,
  getIncome,
  editIncome,
  removeIncome,
};