const Carousel = require("../models/Carousel");

// Get all active carousel items
exports.getCarousels = async (req, res) => {
  try {
    const carousels = await Carousel.find({ isActive: true }).sort({ order: 1 });
    res.json(carousels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get all carousel items (for admin)
exports.getAllCarousels = async (req, res) => {
  try {
    const carousels = await Carousel.find().sort({ order: 1 });
    res.json(carousels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Create carousel item
exports.createCarousel = async (req, res) => {
  try {
    const { mediaType } = req.body;

    const carouselData = {
      mediaType: mediaType || "image",
    };

    // Add image if uploaded
    if (req.files && req.files.image) {
      carouselData.image = `/uploads/${req.files.image[0].filename}`;
    }

    // Add video if uploaded
    if (req.files && req.files.video) {
      carouselData.video = `/uploads/${req.files.video[0].filename}`;
    }

    const carousel = await Carousel.create(carouselData);

    res.status(201).json({
      message: "Carousel item created successfully",
      carousel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update carousel item
exports.updateCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const { mediaType, isActive } = req.body;

    const carousel = await Carousel.findById(id);
    if (!carousel) {
      return res.status(404).json({ message: "Carousel item not found" });
    }

    if (mediaType) carousel.mediaType = mediaType;
    if (isActive !== undefined) carousel.isActive = isActive;

    // Update image if uploaded
    if (req.files && req.files.image) {
      carousel.image = `/uploads/${req.files.image[0].filename}`;
    }

    // Update video if uploaded
    if (req.files && req.files.video) {
      carousel.video = `/uploads/${req.files.video[0].filename}`;
    }

    await carousel.save();

    res.json({
      message: "Carousel item updated successfully",
      carousel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete carousel item
exports.deleteCarousel = async (req, res) => {
  try {
    const { id } = req.params;

    const carousel = await Carousel.findByIdAndDelete(id);
    if (!carousel) {
      return res.status(404).json({ message: "Carousel item not found" });
    }

    res.json({
      message: "Carousel item deleted successfully",
      carousel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Toggle carousel item active status
exports.toggleCarousel = async (req, res) => {
  try {
    const { id } = req.params;

    const carousel = await Carousel.findById(id);
    if (!carousel) {
      return res.status(404).json({ message: "Carousel item not found" });
    }

    carousel.isActive = !carousel.isActive;
    await carousel.save();

    res.json({
      message: `Carousel item ${carousel.isActive ? "activated" : "deactivated"}`,
      carousel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
