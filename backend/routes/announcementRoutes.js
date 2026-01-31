const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createAnnouncement,
  getAnnouncements,
  addReaction,
  removeReaction,
  getReactions,
  addComment,
  deleteComment,
  addReply,
  deleteReply,
} = require("../controllers/announcementController");

/**
 * Create announcement (Management only)
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["management"]),
  createAnnouncement
);

/**
 * Get announcements (Students + Management)
 */
router.get("/", authMiddleware, getAnnouncements);

/**
 * Reactions
 */
router.post("/:id/react", authMiddleware, addReaction);
router.delete("/:id/react", authMiddleware, removeReaction);
router.get("/:id/reactions", authMiddleware, getReactions);

/**
 * Comments
 */
router.post("/:id/comment", authMiddleware, addComment);
router.delete("/:id/comment/:commentId", authMiddleware, deleteComment);

/**
 * Replies
 */
router.post("/:id/comment/:commentId/reply", authMiddleware, addReply);
router.delete("/:id/comment/:commentId/reply/:replyId", authMiddleware, deleteReply);

module.exports = router;
