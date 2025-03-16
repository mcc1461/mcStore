"use strict";
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const User = require("../models/userModel");
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
  // List all users (read-only team listing)
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

  // Create a new user (Registration)
  create: async (req, res) => {
    const {
      username,
      password,
      email,
      firstName,
      lastName,
      role,
      role2,
      roleCode,
      phone,
      city,
      country,
      bio,
    } = req.body;
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          error: true,
          message: "Username already exists.",
        });
      }

      const allowedRoles = ["admin", "staff", "coordinator", "user"];
      let assignedRole = null;
      const roleLower = role ? role.toLowerCase() : "";

      if (req.user && req.user.role === "admin") {
        // Admin can assign any valid role.
        if (!allowedRoles.includes(roleLower)) {
          return res.status(400).json({
            error: true,
            message: "Invalid role.",
          });
        }
        assignedRole = roleLower;
      } else {
        // For non-admin creators, enforce role code for higher roles.
        assignedRole =
          roleLower === "admin" && roleCode === process.env.ADMIN_CODE
            ? "admin"
            : roleLower === "staff" && roleCode === process.env.STAFF_CODE
            ? "staff"
            : roleLower === "coordinator" && roleCode === process.env.RC_CODE
            ? "coordinator"
            : roleLower === "user"
            ? "user"
            : null;
      }

      if (!assignedRole) {
        return res.status(400).json({
          error: true,
          message: "Invalid role or role code.",
        });
      }

      let imageUrl = null;
      console.log("Uploaded files:", req.files);
      if (req.files && req.files.image && req.files.image.length > 0) {
        // Get the first file in the "image" array
        const file = req.files.image[0];
        if (file) {
          imageUrl =
            file.location ||
            (file.key
              ? `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`
              : null);
        }
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
        role2: role2 || null,
        image: imageUrl,
        phone: phone || null,
        city: city || null,
        country: country || null,
        bio: bio || null,
      });

      // --- Temporary Data Tagging ---
      // If the creator is a regular user (not an admin), tag the new user as tester.
      if (req.user && req.user.role === "user") {
        newUser.tester = true;
        newUser.testerCreatedAt = new Date();
      }

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
          role2: newUser.role2,
          image: newUser.image,
          phone: newUser.phone,
          city: newUser.city,
          country: newUser.country,
          bio: newUser.bio,
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

  // Update user details (Profile update)
  update: async (req, res) => {
    try {
      const filters =
        req.user.role === "admin"
          ? { _id: req.params.id }
          : { _id: req.user._id };

      console.log("Update req.body:", req.body);
      console.log("Update req.files:", req.files);

      const user = await User.findOne(filters);
      if (!user) {
        return res
          .status(404)
          .json({ error: true, message: "User not found." });
      }

      // Handle file upload: with multer-s3 the file will have a location property.
      if (req.files && req.files.length > 0) {
        const imageFile = req.files.find((f) => f.fieldname === "image");
        if (imageFile && imageFile.location) {
          req.body.image = imageFile.location;
        }
      } else if (req.body.image) {
        req.body.image = req.body.image.trim();
      }

      // --- Temporary Data Tagging on Update ---
      // If the updater is a regular user, mark the update as temporary.
      if (req.user && req.user.role === "user") {
        req.body.tester = true;
        req.body.testerCreatedAt = new Date();
      }

      console.log("Final update payload:", req.body);

      const updatedUser = await User.findOneAndUpdate(filters, req.body, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        return res
          .status(404)
          .json({ error: true, message: "User not found or no changes made." });
      }

      console.log("Updated user:", updatedUser);
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

  // Delete a user (temporary deletion allowed for regular users)
  // In your userController.js (or similar file)
  remove: async (req, res) => {
    try {
      // Allow deletion if the requester is admin OR user.
      // (Adjust the condition as needed if you want staff also to delete permanently.)
      if (req.user.role !== "admin" && req.user.role !== "user") {
        return res.status(403).json({ error: true, message: "Access denied." });
      }

      // If the requester is a regular user, mark the user as temporarily deleted.
      if (req.user.role === "user") {
        const updatedUser = await User.findOneAndUpdate(
          { _id: req.params.id },
          { testerDeleted: true, testerDeletedAt: new Date() },
          { new: true }
        );
        if (!updatedUser) {
          return res
            .status(404)
            .json({ error: true, message: "User not found." });
        }
        return res.status(200).json({
          error: false,
          message: "User marked as deleted temporarily.",
        });
      } else {
        // For admins, perform a permanent deletion.
        const deletedUser = await User.findOneAndDelete({ _id: req.params.id });
        if (!deletedUser) {
          return res
            .status(404)
            .json({ error: true, message: "User not found." });
        }
        return res.status(200).json({
          error: false,
          message: "User deleted successfully.",
        });
      }
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
