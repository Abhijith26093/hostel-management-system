const Announcement = require("../models/Announcement");
const User = require("../models/User");

/**
 * @desc   Create announcement (Management)
 * @route  POST /api/announcements
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      hostel = "ALL",
      block = "ALL",
      targetRole = "all",
    } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      type,
      hostel,
      block,
      targetRole,
      createdBy: req.user.id,
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc   Get announcements (Role + Hostel based)
 * @route  GET /api/announcements
 */
exports.getAnnouncements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Build query based on user role
    const query = {
      $or: [
        { targetRole: "all" },
        { targetRole: user.role },
      ],
    };

    // Only filter by hostel and block for students
    if (user.role === "student") {
      query.hostel = { $in: ["ALL", user.hostel || ""] };
      query.block = { $in: ["ALL", user.block || ""] };
    }

    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .populate("reactions.user", "name");

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc   Add reaction to announcement
 * @route  POST /api/announcements/:id/react
 */
exports.addReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emoji } = req.body;
    const announcementId = req.params.id;

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if user already reacted
    const existingReactionIndex = announcement.reactions.findIndex(
      (r) => r.user.toString() === userId
    );

    if (existingReactionIndex !== -1) {
      // Update existing reaction
      announcement.reactions[existingReactionIndex].emoji = emoji;
    } else {
      // Add new reaction
      announcement.reactions.push({ user: userId, emoji });
    }

    await announcement.save();

    // Count reactions by emoji
    const reactionCounts = {};
    announcement.reactions.forEach((r) => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });

    res.json({
      message: "Reaction added successfully",
      reactions: reactionCounts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc   Remove reaction from announcement
 * @route  DELETE /api/announcements/:id/react
 */
exports.removeReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const announcementId = req.params.id;

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    announcement.reactions = announcement.reactions.filter(
      (r) => r.user.toString() !== userId
    );

    await announcement.save();

    // Count reactions by emoji
    const reactionCounts = {};
    announcement.reactions.forEach((r) => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });

    res.json({
      message: "Reaction removed successfully",
      reactions: reactionCounts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc   Get reactions for announcement
 * @route  GET /api/announcements/:id/reactions
 */
exports.getReactions = async (req, res) => {
  try {
    const announcementId = req.params.id;

    const announcement = await Announcement.findById(announcementId).populate(
      "reactions.user",
      "name"
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Count reactions by emoji
    const reactionCounts = {};
    announcement.reactions.forEach((r) => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });

    res.json({
      reactions: reactionCounts,
      userReactions: announcement.reactions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc   Add comment to announcement
 * @route  POST /api/announcements/:id/comment
 */
exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;
    const announcementId = req.params.id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const user = await User.findById(userId);
    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const comment = {
      user: userId,
      userName: user.name,
      text: text.trim(),
      createdAt: new Date(),
    };

    announcement.comments.push(comment);
    announcement.commentCount += 1;

    await announcement.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment: comment,
      commentCount: announcement.commentCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc   Delete comment from announcement
 * @route  DELETE /api/announcements/:id/comment/:commentId
 */
exports.deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: announcementId, commentId } = req.params;

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const commentIndex = announcement.comments.findIndex(
      (c) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment author
    if (announcement.comments[commentIndex].user.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    announcement.comments.splice(commentIndex, 1);
    announcement.commentCount = Math.max(0, announcement.commentCount - 1);

    await announcement.save();

    res.json({
      message: "Comment deleted successfully",
      commentCount: announcement.commentCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc   Add reply to comment
 * @route  POST /api/announcements/:id/comment/:commentId/reply
 */
exports.addReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;
    const { id: announcementId, commentId } = req.params;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const user = await User.findById(userId);
    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const comment = announcement.comments.find(
      (c) => c._id.toString() === commentId
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = {
      user: userId,
      userName: user.name,
      text: text.trim(),
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await announcement.save();

    res.status(201).json({
      message: "Reply added successfully",
      reply: reply,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc   Delete reply from comment
 * @route  DELETE /api/announcements/:id/comment/:commentId/reply/:replyId
 */
exports.deleteReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: announcementId, commentId, replyId } = req.params;

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const comment = announcement.comments.find(
      (c) => c._id.toString() === commentId
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const replyIndex = comment.replies.findIndex(
      (r) => r._id.toString() === replyId
    );

    if (replyIndex === -1) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Check if user is the reply author
    if (comment.replies[replyIndex].user.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own replies" });
    }

    comment.replies.splice(replyIndex, 1);
    await announcement.save();

    res.json({
      message: "Reply deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
