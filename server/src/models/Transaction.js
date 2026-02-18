const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["deposit", "withdrawal", "transfer"], required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: "EUR" },
    status: { type: String, enum: ["completed", "failed"], default: "completed" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
