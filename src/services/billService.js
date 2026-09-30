const prisma = require("../config/database");

const VALID_STATUSES = [
  "PENDING",
  "PAID",
  "OVERDUE",
];

async function createBill(
  userId,
  billName,
  amount,
  category,
  dueDate,
  status,
  description
) {
  const bill = await prisma.bill.create({
    data: {
      userId: Number(userId),
      billName: billName.trim(),
      amount,
      category: category.trim(),
      dueDate: new Date(dueDate),
      status: status || "PENDING",
      description: description?.trim() || null,
    },
  });

  return bill;
}

async function getUserBills(userId) {
  return await prisma.bill.findMany({
    where: {
      userId: Number(userId),
    },
    orderBy: {
      dueDate: "asc",
    },
  });
}

async function getBillById(userId, billId) {
  const bill = await prisma.bill.findFirst({
    where: {
      id: Number(billId),
      userId: Number(userId),
    },
  });

  if (!bill) {
    throw new Error("Bill not found");
  }

  return bill;
}

async function updateBill(
  userId,
  billId,
  billName,
  amount,
  category,
  dueDate,
  status,
  description
) {
  const existingBill = await prisma.bill.findFirst({
    where: {
      id: Number(billId),
      userId: Number(userId),
    },
  });

  if (!existingBill) {
    throw new Error("Bill not found");
  }

  const bill = await prisma.bill.update({
    where: {
      id: Number(billId),
    },
    data: {
      billName: billName.trim(),
      amount,
      category: category.trim(),
      dueDate: new Date(dueDate),
      status: status || "PENDING",
      description: description?.trim() || null,
    },
  });

  return bill;
}

async function deleteBill(userId, billId) {
  const existingBill = await prisma.bill.findFirst({
    where: {
      id: Number(billId),
      userId: Number(userId),
    },
  });

  if (!existingBill) {
    throw new Error("Bill not found");
  }

  await prisma.bill.delete({
    where: {
      id: Number(billId),
    },
  });

  return true;
}

module.exports = {
  createBill,
  getUserBills,
  getBillById,
  updateBill,
  deleteBill,
  VALID_STATUSES,
};