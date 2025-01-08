"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
};

module.exports = {
  // List all users (Admin only) or self-profile for non-admin
  list: async (req, res) => {
    try {
      const filters = req.user.role === "admin" ? {} : { _id: req.user._id };
      const users = await User.find(filters);

      if (!users.length) {
        return res
          .status(404)
          .json({ error: true, message: "No users found." });
      }

      res.status(200).json({ error: false, data: users });
    } catch (error) {
      console.error("Error listing users:", error);
      res.status(500).json({ error: true, message: "Server error." });
    }
  },

  // Create a new user
  create: async (req, res) => {
    const { username, password, email, firstName, lastName, role, roleCode } =
      req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: true, message: "Username already exists." });
      }

      // Determine role based on provided role and roleCode
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

      // Create new user
      const newUser = new User({
        username,
        password,
        email,
        firstName,
        lastName,
        role: assignedRole,
      });

      await newUser.save();

      // Generate token
      const token = generateToken(newUser);

      res.status(201).json({
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
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: true, message: "Server error." });
    }
  },

  // Read user details (self or specific user for admin)
  read: async (req, res) => {
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

      res.status(200).json({ error: false, data: user });
    } catch (error) {
      console.error("Error reading user:", error);
      res.status(500).json({ error: true, message: "Server error." });
    }
  },

  // Update user details (self or admin updating any user)
  update: async (req, res) => {
    try {
      const filters =
        req.user.role === "admin"
          ? { _id: req.params.id }
          : { _id: req.user._id };

      if (req.body.password) {
        req.body.password = req.body.password; // Let model handle hashing
      }

      const updatedUser = await User.findOneAndUpdate(filters, req.body, {
        new: true,
        runValidators: true,
        context: { updatedBy: req.user._id },
      });

      if (!updatedUser) {
        return res
          .status(404)
          .json({ error: true, message: "User not found or no changes made." });
      }

      res.status(202).json({
        error: false,
        message: "User updated successfully.",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: true, message: "Server error." });
    }
  },

  // Delete a user (Admin only)
  remove: async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: true, message: "Access denied." });
      }

      const deletedUser = await User.deleteOne({ _id: req.params.id });

      if (!deletedUser.deletedCount) {
        return res
          .status(404)
          .json({ error: true, message: "User not found." });
      }

      res
        .status(200)
        .json({ error: false, message: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: true, message: "Server error." });
    }
  },
};
