"use strict";

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");

const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";

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

// Helper function to delete a file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    } else {
      console.warn(`File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
  }
};

module.exports = {
  // List all users (Admin) or self only (non-admin)
  list: async (req, res) => {
    try {
      const filters = req.user.role === "admin" ? {} : { _id: req.user._id };
      const users = await User.find(filters).select("-password");

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

  // Create a new user
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

      const newUser = new User({
        username,
        password,
        email,
        firstName,
        lastName,
        role: assignedRole,
        image: req.file ? `/uploads/${req.file.filename}` : null,
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

  // Update user details
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

      // If a new file is uploaded, delete old file
      if (req.file) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          "uploads",
          path.basename(user.image || "")
        );
        console.log("Old file path for deletion:", oldFilePath);
        deleteFile(oldFilePath);
        req.body.image = `/uploads/${req.file.filename}`;
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

      if (deletedUser.image) {
        const imagePath = path.join(
          __dirname,
          "..",
          "uploads",
          path.basename(deletedUser.image)
        );
        deleteFile(imagePath);
      }

      return res
        .status(200)
        .json({ error: false, message: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ error: true, message: "Server error." });
    }
  },
};
