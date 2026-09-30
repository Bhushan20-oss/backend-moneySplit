const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  addSaving,
  getSavings,
  getSaving,
  editSaving,
  removeSaving,
} = require("../controllers/savingController");

const router = express.Router();

// Add saving
router.post("/", authMiddleware, addSaving);

// Get all savings
router.get("/", authMiddleware, getSavings);

// Get single saving
router.get("/:id", authMiddleware, getSaving);

// Update saving
router.put("/:id", authMiddleware, editSaving);

// Delete saving
router.delete("/:id", authMiddleware, removeSaving);

module.exports = router;