const {
  createBill,
  getUserBills,
  getBillById,
  updateBill,
  deleteBill,
  VALID_STATUSES,
} = require("../services/billService");

async function addBill(req, res) {
  try {
    const {
      billName,
      amount,
      category,
      dueDate,
      status,
      description,
    } = req.body || {};

    if (
      !billName ||
      amount === undefined ||
      amount === null ||
      !category ||
      !dueDate
    ) {
      return res.status(400).json({
        message:
          "Bill name, amount, category and due date are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const date = new Date(dueDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid due date",
      });
    }

    const billStatus = status || "PENDING";

    if (!VALID_STATUSES.includes(billStatus)) {
      return res.status(400).json({
        message:
          "Status must be PENDING, PAID or OVERDUE",
      });
    }

    const bill = await createBill(
      req.user.userId,
      billName,
      amount,
      category,
      dueDate,
      billStatus,
      description
    );

    return res.status(201).json({
      message: "Bill added successfully",
      bill,
    });
  } catch (error) {
    console.error("Add bill error:", error);

    return res.status(500).json({
      message: "Failed to add bill",
    });
  }
}

async function getBills(req, res) {
  try {
    const bills = await getUserBills(
      req.user.userId
    );

    return res.status(200).json({
      message: "Bills fetched successfully",
      bills,
    });
  } catch (error) {
    console.error("Get bills error:", error);

    return res.status(500).json({
      message: "Failed to fetch bills",
    });
  }
}

async function getBill(req, res) {
  try {
    const bill = await getBillById(
      req.user.userId,
      req.params.id
    );

    return res.status(200).json({
      message: "Bill fetched successfully",
      bill,
    });
  } catch (error) {
    console.error("Get bill error:", error);

    if (error.message === "Bill not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch bill",
    });
  }
}

async function editBill(req, res) {
  try {
    const {
      billName,
      amount,
      category,
      dueDate,
      status,
      description,
    } = req.body || {};

    if (
      !billName ||
      amount === undefined ||
      amount === null ||
      !category ||
      !dueDate
    ) {
      return res.status(400).json({
        message:
          "Bill name, amount, category and due date are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const date = new Date(dueDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid due date",
      });
    }

    const billStatus = status || "PENDING";

    if (!VALID_STATUSES.includes(billStatus)) {
      return res.status(400).json({
        message:
          "Status must be PENDING, PAID or OVERDUE",
      });
    }

    const bill = await updateBill(
      req.user.userId,
      req.params.id,
      billName,
      amount,
      category,
      dueDate,
      billStatus,
      description
    );

    return res.status(200).json({
      message: "Bill updated successfully",
      bill,
    });
  } catch (error) {
    console.error("Update bill error:", error);

    if (error.message === "Bill not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update bill",
    });
  }
}

async function removeBill(req, res) {
  try {
    await deleteBill(
      req.user.userId,
      req.params.id
    );

    return res.status(200).json({
      message: "Bill deleted successfully",
    });
  } catch (error) {
    console.error("Delete bill error:", error);

    if (error.message === "Bill not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to delete bill",
    });
  }
}

module.exports = {
  addBill,
  getBills,
  getBill,
  editBill,
  removeBill,
};
