const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["plumbing", "electrical", "cleanliness", "internet", "furniture", "other"],
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "low",
    },

    status: {
      type: String,
      enum: ["reported", "assigned", "inprogress", "resolved", "closed"],
      default: "reported",
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    assignedTo: {
  type: String, // caretaker / staff name (simple for now)
},
statusTimestamps: {
  reported: {
    type: Date,
    default: Date.now,
  },
  assigned: Date,
  inProgress: Date,
  resolved: Date,
  closed: Date,
},



    hostel: String,
    block: String,
    room: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String, // "image" or "video"
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);
