const {
  getMonthlyReport,
  getMonthlyComparison,
} = require("../services/reportService");

function validateMonthYear(month, year) {
  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return false;
  }

  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100
  ) {
    return false;
  }

  return true;
}

async function getReport(req, res) {
  try {
    const currentDate = new Date();

    const month = Number(
      req.query.month ||
        currentDate.getMonth() + 1
    );

    const year = Number(
      req.query.year ||
        currentDate.getFullYear()
    );

    if (!validateMonthYear(month, year)) {
      return res.status(400).json({
        message: "Invalid month or year",
      });
    }

    const report = await getMonthlyReport(
      req.user.userId,
      month,
      year
    );

    return res.status(200).json({
      message:
        "Monthly report fetched successfully",
      report,
    });
  } catch (error) {
    console.error(
      "Monthly report error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch monthly report",
    });
  }
}

async function getComparison(req, res) {
  try {
    const currentDate = new Date();

    const month = Number(
      req.query.month ||
        currentDate.getMonth() + 1
    );

    const year = Number(
      req.query.year ||
        currentDate.getFullYear()
    );

    if (!validateMonthYear(month, year)) {
      return res.status(400).json({
        message: "Invalid month or year",
      });
    }

    const comparison =
      await getMonthlyComparison(
        req.user.userId,
        month,
        year
      );

    return res.status(200).json({
      message:
        "Monthly comparison fetched successfully",
      comparison,
    });
  } catch (error) {
    console.error(
      "Monthly comparison error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch monthly comparison",
    });
  }
}

module.exports = {
  getReport,
  getComparison,
};