const Issue = require("../models/Issue");
const User = require("../models/User");

/**
 * @desc   Create a new issue (Student)
 * @route  POST /api/issues
 * @access Student
 */
exports.createIssue = async (req, res) => {
  try {
    const { title, description, category, priority, visibility } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ message: "Title, description, and category are required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Process file attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        attachments.push({
          fileName: file.originalname,
          fileUrl: `http://localhost:5000/uploads/${file.filename}`,
          fileType: file.mimetype
        });
      });
    }

    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      category: category.toLowerCase(),
      priority: priority || "low",
      visibility: visibility || "public",
      attachments: attachments,

      hostel: user.hostel,
      block: user.block,
      room: user.room,

      createdBy: user._id,
    });

    res.status(201).json(issue);
  } catch (error) {
    console.error("Create issue error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc   Get issues
 * @route  GET /api/issues
 * @access Student / Management
 */
exports.getIssues = async (req, res) => {
  try {
    let issues;

    if (req.user.role === "student") {
      // Student: see own issues + public issues
      issues = await Issue.find({
        $or: [
          { createdBy: req.user.id },
          { visibility: "public" },
        ],
      }).populate("createdBy", "name role");
    } else {
      // Management: see all issues
      issues = await Issue.find().populate(
        "createdBy",
        "name hostel block room"
      );
    }

    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * @desc   Update issue status (Management)
 * @route  PATCH /api/issues/:id/status
 * @access Management
 */
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Assign staff (only once)
    if (assignedTo && !issue.assignedTo) {
      issue.assignedTo = assignedTo;

      if (!issue.statusTimestamps.assigned) {
        issue.statusTimestamps.assigned = new Date();
      }
    }

    // Status transition logic (DO NOT overwrite)
    if (status && issue.status !== status) {
      issue.status = status;

      if (status === "inprogress" && !issue.statusTimestamps.inProgress) {
        issue.statusTimestamps.inProgress = new Date();
      }

      if (status === "resolved" && !issue.statusTimestamps.resolved) {
        issue.statusTimestamps.resolved = new Date();
      }

      if (status === "closed" && !issue.statusTimestamps.closed) {
        issue.statusTimestamps.closed = new Date();
      }
    }

    await issue.save();
    res.status(200).json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
