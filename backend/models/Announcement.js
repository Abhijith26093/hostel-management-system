const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: String,
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: String,
    text: {
      type: String,
      required: true,
    },
    replies: [replySchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    emoji: String,
  },
  { _id: false }
);

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["cleaning", "pest-control", "water", "electricity", "maintenance", "general"],
      default: "general",
    },

    // Targeting
    hostel: {
      type: String, // e.g. "A", "B", or "ALL"
      default: "ALL",
    },

    block: {
      type: String, // e.g. "East", "West", or "ALL"
      default: "ALL",
    },

    targetRole: {
      type: String,
      enum: ["student", "management", "all"],
      default: "all",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Reactions instead of likes
    reactions: [reactionSchema],

    comments: [commentSchema],

    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
