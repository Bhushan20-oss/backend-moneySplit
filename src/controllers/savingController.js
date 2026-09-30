const {
  createSaving,
  getUserSavings,
  getSavingById,
  updateSaving,
  deleteSaving,
} = require("../services/savingService");

async function addSaving(req, res) {
  try {
    const {
      amount,
      savingType,
      description,
      savingDate,
    } = req.body || {};

    if (
      amount === undefined ||
      amount === null ||
      !savingType ||
      !savingDate
    ) {
      return res.status(400).json({
        message: "Amount, saving type and saving date are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const date = new Date(savingDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid saving date",
      });
    }

    const saving = await createSaving(
      req.user.userId,
      amount,
      savingType,
      description,
      savingDate
    );

    return res.status(201).json({
      message: "Saving added successfully",
      saving,
    });
  } catch (error) {
    console.error("Add saving error:", error);

    return res.status(500).json({
      message: "Failed to add saving",
    });
  }
}

async function getSavings(req, res) {
  try {
    const savings = await getUserSavings(
      req.user.userId
    );

    return res.status(200).json({
      message: "Savings fetched successfully",
      savings,
    });
  } catch (error) {
    console.error("Get savings error:", error);

    return res.status(500).json({
      message: "Failed to fetch savings",
    });
  }
}

async function getSaving(req, res) {
  try {
    const saving = await getSavingById(
      req.user.userId,
      req.params.id
    );

    return res.status(200).json({
      message: "Saving fetched successfully",
      saving,
    });
  } catch (error) {
    console.error("Get saving error:", error);

    if (error.message === "Saving not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch saving",
    });
  }
}

async function editSaving(req, res) {
  try {
    const {
      amount,
      savingType,
      description,
      savingDate,
    } = req.body || {};

    if (
      amount === undefined ||
      amount === null ||
      !savingType ||
      !savingDate
    ) {
      return res.status(400).json({
        message: "Amount, saving type and saving date are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const date = new Date(savingDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid saving date",
      });
    }

    const saving = await updateSaving(
      req.user.userId,
      req.params.id,
      amount,
      savingType,
      description,
      savingDate
    );

    return res.status(200).json({
      message: "Saving updated successfully",
      saving,
    });
  } catch (error) {
    console.error("Update saving error:", error);

    if (error.message === "Saving not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update saving",
    });
  }
}

async function removeSaving(req, res) {
  try {
    await deleteSaving(
      req.user.userId,
      req.params.id
    );

    return res.status(200).json({
      message: "Saving deleted successfully",
    });
  } catch (error) {
    console.error("Delete saving error:", error);

    if (error.message === "Saving not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to delete saving",
    });
  }
}

module.exports = {
  addSaving,
  getSavings,
  getSaving,
  editSaving,
  removeSaving,
};
