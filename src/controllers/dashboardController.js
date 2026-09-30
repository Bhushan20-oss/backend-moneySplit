const {
  getDashboardData,
} = require("../services/dashboardService");

async function getDashboard(req, res) {
  try {
    const currentDate = new Date();

    const month = Number(
      req.query.month || currentDate.getMonth() + 1
    );

    const year = Number(
      req.query.year || currentDate.getFullYear()
    );

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      return res.status(400).json({
        message: "Month must be between 1 and 12",
      });
    }

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      return res.status(400).json({
        message: "Invalid year",
      });
    }

    const dashboard = await getDashboardData(
      req.user.userId,
      month,
      year
    );

    return res.status(200).json({
      message: "Dashboard data fetched successfully",
      dashboard,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      message: "Failed to fetch dashboard data",
    });
  }
}

module.exports = {
  getDashboard,
};