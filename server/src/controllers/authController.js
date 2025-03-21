"use strict";
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const User = require("../models/userModel");
const sendResetEmail = require("../helpers/sendResetEmail"); // Ensure this helper is defined

const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your_default_refresh_secret";

// Helper function to generate JWT tokens
const generateToken = (user, secret = JWT_SECRET, expiresIn = "1d") => {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const register = async (req, res) => {
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
      if (!allowedRoles.includes(roleLower)) {
        return res.status(400).json({
          error: true,
          message: "Invalid role.",
        });
      }
      assignedRole = roleLower;
    } else {
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
      email: email.trim().toLowerCase(),
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

    // Tag regular users if applicable
    if (req.user && req.user.role === "user") {
      newUser.tester = true;
      newUser.testerCreatedAt = new Date();
    }

    await newUser.save();
    const accessToken = generateToken(newUser, JWT_SECRET, "1d");
    const refreshToken = generateToken(newUser, JWT_REFRESH_SECRET, "30d");

    return res.status(201).json({
      error: false,
      message: "User registered successfully.",
      bearer: { accessToken, refreshToken },
      user: {
        id: newUser._id,
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
      message: "Login successful.",
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
    return res
      .status(500)
      .json({ message: "Login failed", error: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token." });
      }

      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(403).json({ message: "User not found." });
      }

      const newAccessToken = generateToken(user, JWT_SECRET, "1d");
      return res.json({
        message: "Token refreshed successfully.",
        bearer: { accessToken: newAccessToken },
      });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to refresh token", error: error.message });
  }
};

const logout = (req, res) => {
  return res.json({ message: "Logged out successfully." });
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Normalize email and find user
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email address." });
    }

    // Create a JWT reset token valid for 1 hour
    const resetToken = generateToken(user, JWT_SECRET, "1h");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Construct reset URL (adjust FRONTEND_BASE_URL as needed)
    // const resetLink = `${
    //   process.env.VITE_APP_API_URL || "http://127.0.0.1:3061"
    // }/resetPassword?token=${resetToken}`;
    const resetLink = `${"http://127.0.0.1:3061"}/resetPassword?token=${resetToken}`;

    // Send email with the reset link
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
    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ message: "Reset token and new password are required." });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }

    // Verify and decode the reset token
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user || user.resetPasswordToken !== resetToken) {
      return res
        .status(403)
        .json({ message: "Invalid or expired reset token." });
    }

    // Update password and clear reset token info
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
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
};
