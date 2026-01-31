const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "management"],
      default: "student",
    },
    hostel: {
      type: String,
      enum: ["", "A", "B", "C", "D"],
      default: "",
    },
    block: {
      type: String,
      enum: ["", "1", "2", "3", "4"],
      default: "",
    },
    room: String,
    profileImage: String, // URL to uploaded profile image
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

/**
 * ✅ IMPORTANT RULES:
 * - DO NOT use arrow function
 * - DO NOT forget next
 * - Use normal function keyword
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


module.exports = mongoose.model("User", userSchema);
