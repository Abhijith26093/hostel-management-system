const Issue = require("../models/Issue");

/**
 * GET /api/analytics
 * Management dashboard analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    // ONLY public issues
    const matchStage = { visibility: "public" };

    // 1️⃣ Most frequent categories
    const categoryStats = await Issue.aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // 2️⃣ Hostel-wise issue density
    const hostelStats = await Issue.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$user.hostel",
          count: { $sum: 1 },
        },
      },
    ]);

    // 3️⃣ Pending vs Resolved
    const statusStats = await Issue.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // 4️⃣ Average response & resolution time
    const timeStats = await Issue.aggregate([
      {
        $match: {
          visibility: "public",
          "statusTimestamps.inProgress": { $exists: true },
          "statusTimestamps.resolved": { $exists: true },
        },
      },
      {
        $project: {
          responseTime: {
            $subtract: [
              "$statusTimestamps.inProgress",
              "$statusTimestamps.reported",
            ],
          },
          resolutionTime: {
            $subtract: [
              "$statusTimestamps.resolved",
              "$statusTimestamps.reported",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: "$responseTime" },
          avgResolutionTime: { $avg: "$resolutionTime" },
        },
      },
    ]);

    res.json({
      categoryStats,
      hostelStats,
      statusStats,
      avgTimes: timeStats[0] || {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
