const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, hostel, block, room } = req.body;

    // Validate hostel and block for students
    if (role === "student") {
      const validHostels = ["A", "B", "C", "D"];
      const validBlocks = ["1", "2", "3", "4"];

      if (!validHostels.includes(hostel)) {
        return res.status(400).json({ message: "Hostel must be A, B, C, or D" });
      }
      if (!validBlocks.includes(block)) {
        return res.status(400).json({ message: "Block must be 1, 2, 3, or 4" });
      }
      if (!room) {
        return res.status(400).json({ message: "Room number is required" });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const userData = {
      name,
      email,
      password,
      role,
      hostel,
      block,
      room
    };

    // Add profile image if uploaded
    if (req.file) {
      userData.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.create(userData);

    res.status(201).json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist" });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Return token to frontend (in production, send via email)
    res.json({
      message: "Password reset token generated",
      resetToken: resetToken,
      email: email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verify reset token and expiry
    if (!user.resetToken || user.resetToken !== resetToken) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // Update password
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { name, email, hostel, block, room, imageRemoved } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (hostel) user.hostel = hostel;
    if (block) user.block = block;
    if (room) user.room = room;

    // Update profile image if uploaded
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    } else if (imageRemoved === "true") {
      // Remove profile image if requested
      user.profileImage = undefined;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostel: user.hostel,
        block: user.block,
        room: user.room,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
