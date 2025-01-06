const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema
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
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["admin", "staff", "user"],
      default: "user",
    },
    lastLogin: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { collection: "users", timestamps: true }
);

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// Pre-save hook to hash the password
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (!passwordRegex.test(this.password)) {
      return next(
        new Error(
          "Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character."
        )
      );
    }
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Pre-update hook to hash the password when updating
UserSchema.pre("findOneAndUpdate", async function (next) {
  if (this._update.password) {
    if (!passwordRegex.test(this._update.password)) {
      return next(
        new Error(
          "Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character."
        )
      );
    }
    try {
      const salt = await bcrypt.genSalt(10);
      this._update.password = await bcrypt.hash(this._update.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Middleware to set `updatedBy` field automatically
UserSchema.pre("findOneAndUpdate", function (next) {
  if (this.options?.context?.updatedBy) {
    this._update.updatedBy = this.options.context.updatedBy;
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
