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

async function getMonthlyReport(userId, month, year) {
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
        incomeDate: "asc",
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
        expenseDate: "asc",
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
        savingDate: "asc",
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
    (total, item) =>
      total + Number(item.amount),
    0
  );

  const totalExpenses = expenses.reduce(
    (total, item) =>
      total + Number(item.amount),
    0
  );

  const totalSavings = savings.reduce(
    (total, item) =>
      total + Number(item.amount),
    0
  );

  const remainingMoney =
    totalIncome -
    totalExpenses -
    totalSavings;

  const totalBudget = budgets.reduce(
    (total, item) =>
      total + Number(item.amount),
    0
  );

  const budgetUsed = {};

  expenses.forEach((expense) => {
    if (!budgetUsed[expense.category]) {
      budgetUsed[expense.category] = 0;
    }

    budgetUsed[expense.category] +=
      Number(expense.amount);
  });

  const budgetDetails = budgets.map((budget) => {
    const spent =
      budgetUsed[budget.category] || 0;

    return {
      category: budget.category,
      budget: Number(budget.amount),
      spent,
      remaining:
        Number(budget.amount) - spent,
      percentageUsed:
        Number(budget.amount) > 0
          ? Number(
              (
                (spent /
                  Number(budget.amount)) *
                100
              ).toFixed(2)
            )
          : 0,
    };
  });

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

  const totalBills = bills.reduce(
    (total, bill) =>
      total + Number(bill.amount),
    0
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

  const savingsRate =
    totalIncome > 0
      ? Number(
          (
            (totalSavings /
              totalIncome) *
            100
          ).toFixed(2)
        )
      : 0;

  const expenseRate =
    totalIncome > 0
      ? Number(
          (
            (totalExpenses /
              totalIncome) *
            100
          ).toFixed(2)
        )
      : 0;

  return {
    month: Number(month),
    year: Number(year),

    summary: {
      totalIncome,
      totalExpenses,
      totalSavings,
      remainingMoney,
      savingsRate,
      expenseRate,
    },

    budget: {
      totalBudget,
      totalSpent: totalExpenses,
      remaining:
        totalBudget - totalExpenses,
      details: budgetDetails,
    },

    bills: {
      totalBills,
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

    transactions: {
      incomes,
      expenses,
      savings,
      bills,
    },
  };
}
function getPreviousMonth(month, year) {
  if (Number(month) === 1) {
    return {
      month: 12,
      year: Number(year) - 1,
    };
  }

  return {
    month: Number(month) - 1,
    year: Number(year),
  };
}

async function getMonthTotals(userId, month, year) {
  const {
    startOfMonth,
    startOfNextMonth,
  } = getMonthRange(month, year);

  const userIdNumber = Number(userId);

  const [
    incomes,
    expenses,
    savings,
  ] = await Promise.all([
    prisma.income.findMany({
      where: {
        userId: userIdNumber,
        incomeDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
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
    }),

    prisma.saving.findMany({
      where: {
        userId: userIdNumber,
        savingDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
    }),
  ]);

  const totalIncome = incomes.reduce(
    (total, item) =>
      total + Number(item.amount),
    0
  );

  const totalExpenses = expenses.reduce(
    (total, item) =>
      total + Number(item.amount),
    0
  );

  const totalSavings = savings.reduce(
    (total, item) =>
      total + Number(item.amount),
    0
  );

  const remainingMoney =
    totalIncome -
    totalExpenses -
    totalSavings;

  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    remainingMoney,
  };
}

function calculateChange(current, previous) {
  const difference = current - previous;

  let percentageChange = 0;

  if (previous !== 0) {
    percentageChange =
      Number(
        ((difference / previous) * 100).toFixed(2)
      );
  }

  return {
    current,
    previous,
    difference,
    percentageChange,
  };
}

async function getMonthlyComparison(
  userId,
  month,
  year
) {
  const previous = getPreviousMonth(
    month,
    year
  );

  const [
    currentTotals,
    previousTotals,
  ] = await Promise.all([
    getMonthTotals(
      userId,
      month,
      year
    ),

    getMonthTotals(
      userId,
      previous.month,
      previous.year
    ),
  ]);

  return {
    currentMonth: {
      month: Number(month),
      year: Number(year),
    },

    previousMonth: {
      month: previous.month,
      year: previous.year,
    },

    comparison: {
      income: calculateChange(
        currentTotals.totalIncome,
        previousTotals.totalIncome
      ),

      expenses: calculateChange(
        currentTotals.totalExpenses,
        previousTotals.totalExpenses
      ),

      savings: calculateChange(
        currentTotals.totalSavings,
        previousTotals.totalSavings
      ),

      remainingMoney: calculateChange(
        currentTotals.remainingMoney,
        previousTotals.remainingMoney
      ),
    },
  };
}
module.exports = {
  getMonthlyReport,
  getMonthlyComparison,
};