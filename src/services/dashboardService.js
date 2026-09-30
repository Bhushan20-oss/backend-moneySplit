const prisma = require("../config/database");

function getMonthRange(month, year) {
  const startOfMonth = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  const startOfNextMonth = new Date(
    Number(year),
    Number(month),
    1
  );

  return {
    startOfMonth,
    startOfNextMonth,
  };
}

async function getDashboardData(userId, month, year) {
  const {
    startOfMonth,
    startOfNextMonth,
  } = getMonthRange(month, year);

  const userIdNumber = Number(userId);

  const [
    incomes,
    expenses,
    savings,
    bills,
    budgets,
  ] = await Promise.all([
    prisma.income.findMany({
      where: {
        userId: userIdNumber,
        incomeDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      orderBy: {
        incomeDate: "desc",
      },
    }),

    prisma.expense.findMany({
      where: {
        userId: userIdNumber,
        expenseDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      orderBy: {
        expenseDate: "desc",
      },
    }),

    prisma.saving.findMany({
      where: {
        userId: userIdNumber,
        savingDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      orderBy: {
        savingDate: "desc",
      },
    }),

    prisma.bill.findMany({
      where: {
        userId: userIdNumber,
        dueDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    }),

    prisma.budget.findMany({
      where: {
        userId: userIdNumber,
        month: Number(month),
        year: Number(year),
      },
      orderBy: {
        category: "asc",
      },
    }),
  ]);

  const totalIncome = incomes.reduce(
    (total, income) =>
      total + Number(income.amount),
    0
  );

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),
    0
  );

  const totalSavings = savings.reduce(
    (total, saving) =>
      total + Number(saving.amount),
    0
  );

  const remainingMoney =
    totalIncome -
    totalExpenses -
    totalSavings;

  const totalBudget = budgets.reduce(
    (total, budget) =>
      total + Number(budget.amount),
    0
  );

  const expenseByCategory = {};

  expenses.forEach((expense) => {
    if (!expenseByCategory[expense.category]) {
      expenseByCategory[expense.category] = 0;
    }

    expenseByCategory[expense.category] +=
      Number(expense.amount);
  });

  const incomeBySource = {};

  incomes.forEach((income) => {
    if (!incomeBySource[income.source]) {
      incomeBySource[income.source] = 0;
    }

    incomeBySource[income.source] +=
      Number(income.amount);
  });

  const savingsByType = {};

  savings.forEach((saving) => {
    if (!savingsByType[saving.savingType]) {
      savingsByType[saving.savingType] = 0;
    }

    savingsByType[saving.savingType] +=
      Number(saving.amount);
  });

  const paidBills = bills.filter(
    (bill) => bill.status === "PAID"
  );

  const pendingBills = bills.filter(
    (bill) => bill.status === "PENDING"
  );

  const overdueBills = bills.filter(
    (bill) => bill.status === "OVERDUE"
  );

  const totalPaidBills = paidBills.reduce(
    (total, bill) =>
      total + Number(bill.amount),
    0
  );

  const totalPendingBills = pendingBills.reduce(
    (total, bill) =>
      total + Number(bill.amount),
    0
  );

  const totalOverdueBills = overdueBills.reduce(
    (total, bill) =>
      total + Number(bill.amount),
    0
  );

  const budgetUsed = {};

  budgets.forEach((budget) => {
    const spent =
      expenseByCategory[budget.category] || 0;

    budgetUsed[budget.category] = {
      budget: Number(budget.amount),
      spent,
      remaining:
        Number(budget.amount) - spent,
    };
  });

  return {
    month: Number(month),
    year: Number(year),

    summary: {
      totalIncome,
      totalExpenses,
      totalSavings,
      remainingMoney,
    },

    budget: {
      totalBudget,
      budgetUsed,
      budgetRemaining:
        totalBudget - totalExpenses,
    },

    bills: {
      totalBills: bills.length,

      paid: {
        count: paidBills.length,
        amount: totalPaidBills,
      },

      pending: {
        count: pendingBills.length,
        amount: totalPendingBills,
      },

      overdue: {
        count: overdueBills.length,
        amount: totalOverdueBills,
      },
    },

    breakdown: {
      expenseByCategory,
      incomeBySource,
      savingsByType,
    },

    recent: {
      expenses: expenses.slice(0, 5),
      income: incomes.slice(0, 5),
      savings: savings.slice(0, 5),
    },

    upcomingBills: bills
      .filter((bill) => bill.status !== "PAID")
      .slice(0, 5),
  };
}

module.exports = {
  getDashboardData,
};