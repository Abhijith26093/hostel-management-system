const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");


const {
  createItem,
  getItems,
  requestClaim,
  approveClaim,
} = require("../controllers/lostFoundController");

// Student
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createItem
);

router.get("/", authMiddleware, getItems);
router.post("/:id/claim", authMiddleware, requestClaim);

// Admin
router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(["management"]),
  approveClaim
);

module.exports = router;
