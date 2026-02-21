const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // 🔥 FIX: not required for Google users
    passwordHash: {
      type: String,
      required: false,
    },

    // Track auth source
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleSub: {
      type: String,
      unique: true,
      sparse: true,
    },
    balanceEUR: {
      type: Number,
      default: 1000,
      min: 0,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);