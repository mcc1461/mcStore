"use strict";
const mongoose = require("mongoose");
const argon2 = require("argon2");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, "Username is required."],
      unique: true,
      index: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required."],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required."],
      unique: true,
      index: true,
      validate: {
        validator: function (v) {
          const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          return emailRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid email address.`,
      },
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, "First name is required."],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Last name is required."],
    },
    role: {
      type: String,
      enum: ["admin", "staff", "coordinator", "user"],
      default: "user",
    },
    role2: {
      type: String,
      trim: true,
      default: null,
    },
    image: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|svg|webp))$/i;
          return v === null || urlRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid URL for an image.`,
      },
    },
    // Additional fields for extended user information
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    city: {
      type: String,
      trim: true,
      default: null,
    },
    country: {
      type: String,
      trim: true,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { collection: "users", timestamps: true }
);

// Pre-save hook to hash the password when modified
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await argon2.hash(this.password);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Instance method to verify password
UserSchema.methods.verifyPassword = async function (password) {
  try {
    return await argon2.verify(this.password, password);
  } catch (err) {
    return false;
  }
};

module.exports = mongoose.model("User", UserSchema);
