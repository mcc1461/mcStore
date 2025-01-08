"use strict";
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendResetEmail = require("../helpers/sendResetEmail");

// Fallback secrets if no environment variables are set
const JWT_SECRET = process.env.JWT_SECRET || "mcc1461_default_jwt_secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "mcc1461_default_refresh_secret";

// Helper: Generate Token
const generateToken = (user, secret, expiresIn) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    secret || JWT_SECRET,
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

    // Check password complexity
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }

    // Assign role based on roleCode
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

    // Create new user
    const newUser = new User({
      username,
      password, // pre-save hook will hash it
      email,
      firstName,
      lastName,
      role: assignedRole,
    });

    await newUser.save();

    // Generate tokens (1h for access, 30d for refresh)
    const accessToken = generateToken(newUser, JWT_SECRET, "1h");
    const refreshToken = generateToken(newUser, JWT_REFRESH_SECRET, "30d");

    // Return tokens + user info
    return res.status(201).json({
      message: "User registered successfully",
      bearer: {
        accessToken,
        refreshToken,
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
    return res.status(500).json({
      message: error.message || "Failed to register user.",
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Ensure both fields exist
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    // Issue access & refresh tokens
    const accessToken = generateToken(user, JWT_SECRET, "1h");
    const refreshToken = generateToken(user, JWT_REFRESH_SECRET, "30d");

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

// Refresh Token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required.",
      });
    }

    // IMPORTANT: Verify the refresh token with JWT_REFRESH_SECRET
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid or expired refresh token.",
        });
      }

      // Attempt to find user by decoded token id
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(403).json({
          message: "User not found.",
        });
      }

      // Generate new 1h access token
      const newAccessToken = generateToken(user, JWT_SECRET, "1h");
      return res.json({
        message: "Token refreshed successfully",
        bearer: { accessToken: newAccessToken },
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to refresh token",
      error: error.message,
    });
  }
};

// Logout User
// Currently does no token check. If you want to verify user is logged in,
// you'd protect this route with a middleware that checks the access token.
const logout = (req, res) => {
  return res.json({ message: "Logged out successfully." });
};

// Request Password Reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Create reset token valid for 1 hour
    const resetToken = generateToken({ id: user._id }, JWT_SECRET, "1h");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1h from now
    await user.save();

    // Email the link
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

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Check password complexity
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }

    // Verify token with JWT_SECRET
    const decoded = jwt.verify(resetToken, JWT_SECRET);

    // Find user & check if the token matches
    const user = await User.findById(decoded.id);
    if (!user || user.resetPasswordToken !== resetToken) {
      return res.status(403).json({
        message: "Invalid or expired reset token.",
      });
    }

    // Update user's password
    user.password = newPassword; // hashed by pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password reset successfully." });
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
