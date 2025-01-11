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
          // Allow null, valid URLs, or file paths
          const urlOrPathRegex =
            /^(https?:\/\/.*\.(?:png|jpg|jpeg|svg|webp))|(^\/uploads\/.*\.(?:png|jpg|jpeg|svg|webp))$/i;
          return v === null || urlOrPathRegex.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid URL or file path for an image.`,
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

// Static method to update user profile image
UserSchema.statics.updateProfileImage = async function (userId, imagePath) {
  return this.findByIdAndUpdate(
    userId,
    { image: imagePath },
    { new: true, runValidators: true }
  );
};

// Static method for updating user fields safely
UserSchema.statics.updateUserProfile = async function (userId, updateData) {
  const allowedUpdates = [
    "firstName",
    "lastName",
    "email",
    "username",
    "image",
  ];
  const filteredUpdates = Object.keys(updateData).reduce((obj, key) => {
    if (allowedUpdates.includes(key)) {
      obj[key] = updateData[key];
    }
    return obj;
  }, {});

  return this.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
    runValidators: true,
  });
};

module.exports = mongoose.model("User", UserSchema);
