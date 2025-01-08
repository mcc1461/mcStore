"use strict";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const sendResetEmail = require("../helpers/sendResetEmail");

const JWT_SECRET = process.env.JWT_SECRET || "mcc1461_default_jwt_secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "mcc1461_default_refresh_secret";

// Helper: Generate Token
const generateToken = (user, secret, expiresIn) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    secret,
    { expiresIn }
  );
};

// Helper: Validate Password
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

/* ----------------------------- Controllers ----------------------------- */

// Register User
const register = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, role, roleCode } =
      req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }

    // Assign the correct role based on roleCode
    let assignedRole = "user";
    if (role === "admin" && roleCode === process.env.ADMIN_CODE) {
      assignedRole = "admin";
    } else if (role === "staff" && roleCode === process.env.STAFF_CODE) {
      assignedRole = "staff";
    } else if (role !== "user") {
      return res.status(403).json({
        message: "Invalid role or role code provided.",
      });
    }

    // Create a new user
    const newUser = new User({
      username,
      password, // Will be hashed by the pre-save hook
      email,
      firstName,
      lastName,
      role: assignedRole,
    });

    await newUser.save();

    // Generate tokens
    const accessToken = generateToken(newUser, JWT_SECRET, "1h");
    const refreshToken = generateToken(newUser, JWT_REFRESH_SECRET, "30d");

    // Send both tokens in the response
    res.status(201).json({
      message: "User registered successfully",
      bearer: {
        accessToken,
        refreshToken, // Include refreshToken in response
      },
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to register user.",
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const accessToken = generateToken(user, JWT_SECRET, "1h");
    const refreshToken = generateToken(user, JWT_REFRESH_SECRET, "30d");

    res.json({
      message: "Login successful",
      bearer: { accessToken, refreshToken },
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// Refresh Token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required.",
      });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid or expired refresh token.",
        });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(403).json({
          message: "User not found.",
        });
      }

      const newAccessToken = generateToken(user, JWT_SECRET, "1h");
      res.json({
        message: "Token refreshed successfully",
        bearer: { accessToken: newAccessToken },
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to refresh token",
      error: error.message,
    });
  }
};

// Logout User
const logout = (req, res) => {
  res.json({ message: "Logged out successfully." });
};

// Request Password Reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const resetToken = generateToken(
      { id: user._id },
      process.env.JWT_SECRET,
      "1h"
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;
    await sendResetEmail(
      user.email,
      "Password Reset Request",
      `Click here to reset your password: ${resetLink}`
    );

    res.json({
      message: "Password reset link sent to email.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send password reset link",
      error: error.message,
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.resetPasswordToken !== resetToken) {
      return res.status(403).json({
        message: "Invalid or expired reset token.",
      });
    }

    user.password = newPassword; // Pre-save hook will hash this password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
};
