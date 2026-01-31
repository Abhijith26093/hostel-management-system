const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createIssue,
  getIssues,
  updateIssueStatus,
} = require("../controllers/issueController");


/**
 * @route   POST /api/issues
 * @desc    Create issue with optional file attachments
 * @access  Student
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["student"]),
  upload.array("attachments", 5),
  createIssue
);

/**
 * @route   GET /api/issues
 * @desc    Get issues
 * @access  Student / Management
 */
router.get("/", authMiddleware, getIssues);
/**
 * @route   PATCH /api/issues/:id/status
 * @desc    Update issue status
 * @access  Management
 */
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["management"]),
  updateIssueStatus
);


module.exports = router;
