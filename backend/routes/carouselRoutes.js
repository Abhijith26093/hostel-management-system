const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getCarousels,
  getAllCarousels,
  createCarousel,
  updateCarousel,
  deleteCarousel,
  toggleCarousel,
} = require("../controllers/carouselController");

// Public routes
router.get("/", getCarousels);

// Admin routes
router.get("/admin/all", authMiddleware, roleMiddleware("management"), getAllCarousels);
router.post("/admin", authMiddleware, roleMiddleware("management"), upload.fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 }]), createCarousel);
router.patch("/admin/:id", authMiddleware, roleMiddleware("management"), upload.fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 }]), updateCarousel);
router.delete("/admin/:id", authMiddleware, roleMiddleware("management"), deleteCarousel);
router.patch("/admin/:id/toggle", authMiddleware, roleMiddleware("management"), toggleCarousel);

module.exports = router;
