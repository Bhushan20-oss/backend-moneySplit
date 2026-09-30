const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  addBill,
  getBills,
  getBill,
  editBill,
  removeBill,
} = require("../controllers/billController");

const router = express.Router();

// Add bill
router.post("/", authMiddleware, addBill);

// Get all bills
router.get("/", authMiddleware, getBills);

// Get single bill
router.get("/:id", authMiddleware, getBill);

// Update bill
router.put("/:id", authMiddleware, editBill);

// Delete bill
router.delete("/:id", authMiddleware, removeBill);

module.exports = router;