// src/services/wallet.service.js
const User = require("../models/User");
const txService = require("./transaction.service");

async function getBalance(userId) {
  const user = await User.findById(userId).select("balanceEUR");
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user.balanceEUR;
}

async function deposit(userId, amount) {
  const amt = Number(amount);
  if (!amt || amt <= 0) {
    const err = new Error("Amount must be > 0");
    err.status = 400;
    throw err;
  }

  // ✅ atomic increment
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { balanceEUR: amt } },
    { new: true }
  );

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  await txService.logDeposit(user._id, amt);
  return user.balanceEUR;
}

async function withdraw(userId, amount) {
  const amt = Number(amount);
  if (!amt || amt <= 0) {
    const err = new Error("Amount must be > 0");
    err.status = 400;
    throw err;
  }

  // ✅ atomic decrement ONLY if enough funds
  const user = await User.findOneAndUpdate(
    { _id: userId, balanceEUR: { $gte: amt } },
    { $inc: { balanceEUR: -amt } },
    { new: true }
  );

  if (!user) {
    // differentiate "user not found" vs "insufficient"
    const exists = await User.exists({ _id: userId });
    const err = new Error(exists ? "Insufficient funds" : "User not found");
    err.status = exists ? 400 : 404;
    throw err;
  }

  await txService.logWithdrawal(user._id, amt);
  return user.balanceEUR;
}

module.exports = { getBalance, deposit, withdraw };
