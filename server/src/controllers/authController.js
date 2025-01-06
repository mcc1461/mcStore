"use strict";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const sendResetEmail = require("../helpers/sendResetEmail");

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const register = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, role, roleCode } =
      req.body;

    let assignedRole = "user"; // Default role

    // Check the role and roleCode
    if (role === "admin" && roleCode === process.env.ADMIN_CODE) {
      assignedRole = "admin";
    } else if (role === "staff" && roleCode === process.env.STAFF_CODE) {
      assignedRole = "staff";
    } else if (role !== "user") {
      return res.status(403).json({
        error: true,
        message: "Invalid role or role code provided.",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      role: assignedRole,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || "Failed to register user.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is not active.",
      });
    }

    const accessToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.ACCESS_KEY,
      { expiresIn: "10d" }
    );

    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_KEY, {
      expiresIn: "30d",
    });

    return res.json({
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
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body.bearer || {};

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required.",
      });
    }

    jwt.verify(refreshToken, process.env.REFRESH_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid refresh token.",
        });
      }

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return res.status(403).json({
          message: "Account is not active.",
        });
      }

      const accessToken = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.ACCESS_KEY,
        { expiresIn: "10d" }
      );

      return res.json({
        message: "Token refreshed successfully",
        bearer: { accessToken },
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to refresh token",
      error: error.message,
    });
  }
};

const logout = (req, res) => {
  return res.json({
    message: "Logged out successfully.",
  });
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.RESET_KEY, {
      expiresIn: "1h",
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;

    await sendResetEmail(
      user.email,
      "Password Reset Request",
      `Click here to reset your password: ${resetLink}`
    );

    return res.json({
      message: "Password reset link sent to email.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send password reset link",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password does not meet the required criteria.",
      });
    }

    const decoded = jwt.verify(resetToken, process.env.RESET_KEY);
    const user = await User.findById(decoded.id);

    if (!user || user.resetPasswordToken !== resetToken) {
      return res.status(403).json({
        message: "Invalid or expired reset token.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({
      message: "Password reset successfully.",
    });
  } catch (error) {
    return res.status(500).json({
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
