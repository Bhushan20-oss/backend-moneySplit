const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const savingRoutes = require("./routes/savingRoutes");
const billRoutes = require("./routes/billRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());

// Parse JSON request body
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "MoneySplit API is running",
  });
});

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/savings", savingRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);

module.exports = app;