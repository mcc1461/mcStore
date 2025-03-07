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
      enum: ["admin", "staff", "user"],
      default: "user",
    },
    image: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          // Accept only valid URLs (S3 returns a full URL)
          const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|svg|webp))$/i;
          return v === null || urlRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid URL for an image.`,
      },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { collection: "users", timestamps: true }
);

// Pre-save hook to hash the password with argon2
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

// Method to verify password using argon2
UserSchema.methods.verifyPassword = async function (password) {
  try {
    return await argon2.verify(this.password, password);
  } catch (err) {
    return false;
  }
};

module.exports = mongoose.model("User", UserSchema);
