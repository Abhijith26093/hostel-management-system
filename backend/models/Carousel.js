const mongoose = require("mongoose");

const carouselSchema = new mongoose.Schema(
  {
    image: String,
    video: String,
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Carousel", carouselSchema);
