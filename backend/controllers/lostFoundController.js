const LostFound = require("../models/LostFound");

/**
 * Student: Report lost/found item
 */
exports.createItem = async (req, res) => {
  try {
    const item = await LostFound.create({
      itemName: req.body.itemName,
      description: req.body.description,
      location: req.body.location,
      date: req.body.date,
      status: req.body.status || "lost",
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      reportedBy: req.user.id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * Get all items (students + admin)
 */
exports.getItems = async (req, res) => {
  try {
    const items = await LostFound.find()
      .populate("reportedBy", "name")
      .populate("claimRequestedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Student: Request claim / Mark as found
 * If the requester is the item owner (for lost items), auto-approve
 * If claiming a found item, needs admin approval
 */
exports.requestClaim = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // If it's a lost item and the person claiming is the owner, auto approve
    if (item.status === "lost" && item.reportedBy.toString() === req.user.id) {
      item.status = "claimed";
      item.claimRequestedBy = req.user.id;
    } else {
      // For any other case (lost item claimed by someone else, or found item claimed by someone)
      // Needs admin approval
      item.status = "claim-pending";
      item.claimRequestedBy = req.user.id;
    }
    
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin: Approve claim
 */
exports.approveClaim = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.status = "claimed";
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
