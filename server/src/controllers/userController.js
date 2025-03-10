"use strict";
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const User = require("../models/userModel");
const path = require("path");
const sharp = require("sharp");
const { S3Client, UploadCommand } = require("@aws-sdk/client-s3");

const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";

// Configure S3 client using AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
};

module.exports = {
  // List all users (everyone sees the full team for read-only purposes)
  list: async (req, res) => {
    try {
      const users = await User.find({}).select("-password");
      if (!users.length) {
        return res
          .status(404)
          .json({ error: true, message: "No users found." });
      }
      return res.status(200).json({ error: false, data: users });
    } catch (error) {
      console.error("Error listing users:", error);
      return res.status(500).json({ error: true, message: "Server error." });
    }
  },

  // Create a new user (Registration) with image processing via Sharp and AWS SDK v3 upload
  create: async (req, res) => {
    const { username, password, email, firstName, lastName, role, roleCode } =
      req.body;
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: true, message: "Username already exists." });
      }

      const assignedRole =
        role === "admin" && roleCode === process.env.ADMIN_CODE
          ? "admin"
          : role === "staff" && roleCode === process.env.STAFF_CODE
          ? "staff"
          : role === "user"
          ? "user"
          : null;

      if (!assignedRole) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid role or role code." });
      }

      let imageUrl = null;
      // Process image using Sharp if file is available in memory (req.file.buffer)
      if (req.file && req.file.buffer) {
        const resizedBuffer = await sharp(req.file.buffer)
          .resize({ width: 300, height: 300, fit: "inside" })
          .toBuffer();

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `images/${Date.now()}-${req.file.originalname}`,
          Body: resizedBuffer,
          ContentType: req.file.mimetype,
        };

        const command = new UploadCommand(uploadParams);
        const uploadResult = await s3.send(command);
        imageUrl = uploadResult.Location;
      } else if (req.body.image) {
        imageUrl = req.body.image.trim();
      }

      const newUser = new User({
        username,
        password,
        email,
        firstName,
        lastName,
        role: assignedRole,
        image: imageUrl,
      });

      await newUser.save();
      const token = generateToken(newUser);

      return res.status(201).json({
        error: false,
        message: "User registered successfully.",
        token,
        user: {
          _id: newUser._id,
          username,
          email,
          firstName,
          lastName,
          role: assignedRole,
          image: newUser.image,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: true, message: "Server error." });
    }
  },

  // Read user details
  read: async (req, res) => {
    try {
      const filters =
        req.user.role === "admin"
          ? { _id: req.params.id }
          : { _id: req.user._id };
      const user = await User.findOne(filters).select("-password");
      if (!user) {
        return res
          .status(404)
          .json({ error: true, message: "User not found." });
      }
      return res.status(200).json({ error: false, data: user });
    } catch (error) {
      console.error("Error reading user:", error);
      return res.status(500).json({ error: true, message: "Server error." });
    }
  },

  // Update user details (Profile update) with optional image processing if file is provided
  update: async (req, res) => {
    try {
      const filters =
        req.user.role === "admin"
          ? { _id: req.params.id }
          : { _id: req.user._id };
      const user = await User.findOne(filters);
      if (!user) {
        return res
          .status(404)
          .json({ error: true, message: "User not found." });
      }

      // If a new file is uploaded via memory storage, process and upload it
      if (req.file && req.file.buffer) {
        const resizedBuffer = await sharp(req.file.buffer)
          .resize({ width: 300, height: 300, fit: "inside" })
          .toBuffer();

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `images/${Date.now()}-${req.file.originalname}`,
          Body: resizedBuffer,
          ContentType: req.file.mimetype,
        };

        const command = new UploadCommand(uploadParams);
        const uploadResult = await s3.send(command);
        req.body.image = uploadResult.Location;
      } else if (req.body.image) {
        req.body.image = req.body.image.trim();
      }

      const updatedUser = await User.findOneAndUpdate(filters, req.body, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          error: true,
          message: "User not found or no changes made.",
        });
      }

      return res.status(202).json({
        error: false,
        message: "Profile updated successfully.",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ error: true, message: "Server error." });
    }
  },

  // Delete a user (Admin only)
  remove: async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: true, message: "Access denied." });
      }

      const deletedUser = await User.findOneAndDelete({ _id: req.params.id });
      if (!deletedUser) {
        return res
          .status(404)
          .json({ error: true, message: "User not found." });
      }

      // No local file deletion is needed because images are stored on S3.
      return res
        .status(200)
        .json({ error: false, message: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ error: true, message: "Server error." });
    }
  },

  // Request password reset
  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: "No account found with this email address.",
        });
      }

      const resetToken = generateToken(user, JWT_SECRET, "1h");
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();

      const resetLink = `${
        process.env.FRONTEND_BASE_URL || "http://localhost:3061"
      }/reset-password?token=${resetToken}`;
      // Assume sendResetEmail is defined and imported elsewhere
      await sendResetEmail(
        user.email,
        "Password Reset Request",
        `Click here to reset your password: ${resetLink}`
      );

      return res.json({ message: "Password reset link sent to email." });
    } catch (error) {
      console.error("Error in requestPasswordReset:", error);
      return res.status(500).json({
        message: "Failed to send password reset link",
        error: error.message,
      });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { resetToken, newPassword } = req.body;
      if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
          newPassword
        )
      ) {
        return res.status(400).json({
          message:
            "Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.",
        });
      }

      const decoded = jwt.verify(resetToken, JWT_SECRET);
      const user = await User.findById(decoded._id);
      if (!user || user.resetPasswordToken !== resetToken) {
        return res
          .status(403)
          .json({ message: "Invalid or expired reset token." });
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.json({ message: "Password reset successfully." });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Reset token expired." });
      }
      return res
        .status(500)
        .json({ message: "Failed to reset password", error: error.message });
    }
  },
};
