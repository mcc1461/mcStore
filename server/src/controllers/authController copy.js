"use strict";
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const User = require("../models/userModel");
const sendResetEmail = require("../helpers/sendResetEmail");

const JWT_SECRET = process.env.JWT_SECRET || "mcc1461_default_jwt_secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "mcc1461_default_refresh_secret";

// Helper: Generate Token
const generateToken = (user, secret, expiresIn) => {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      role: user.role,
    },
    secret || JWT_SECRET,
    { expiresIn }
  );
};

// Helper: Validate Password Complexity
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

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

    const newUser = new User({
      username,
      password,
      email,
      firstName,
      lastName,
      role: assignedRole,
    });

    // --- Handle image upload ---
    // If a file was uploaded via Multer:
    if (req.file) {
      // For multer-s3, req.file.location holds the URL of the file
      if (req.file.location) {
        newUser.image = req.file.location;
      }
      // // For disk storage, req.file.filename is available
      // else if (req.file.filename) {
      //   newUser.image = "/uploads/" + req.file.filename;
      // }
      else {
        newUser.image = null;
      }
    } else if (req.body.image) {
      // Otherwise, if an image URL is provided in the body, use that.
      newUser.image = req.body.image.trim();
    }
    // --- End image upload handling ---

    await newUser.save();

    // Generate tokens
    const accessToken = generateToken(newUser, JWT_SECRET, "1d");
    const refreshToken = generateToken(newUser, JWT_REFRESH_SECRET, "30d");

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
        image: newUser.image,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to register user.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const accessToken = generateToken(user, JWT_SECRET, "1d");
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
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

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

      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(403).json({
          message: "User not found.",
        });
      }

      const newAccessToken = generateToken(user, JWT_SECRET, "1d");
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

const logout = (req, res) => {
  return res.json({ message: "Logged out successfully." });
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address.",
      });
    }

    // Create reset token valid for 1 hour
    const resetToken = generateToken(user, JWT_SECRET, "1h");

    // Store token in user document for later verification
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    const resetLink = `${
      process.env.FRONTEND_BASE_URL || "http://localhost:3061"
    }/reset-password?token=${resetToken}`;

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
};

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

    const decoded = jwt.verify(resetToken, JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded._id);
    if (!user || user.resetPasswordToken !== resetToken) {
      return res
        .status(403)
        .json({ message: "Invalid or expired reset token." });
    }

    // Update password and clear reset token data
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
