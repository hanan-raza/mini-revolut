const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("_id fullName email balanceEUR role");
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const transactions = await Transaction.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("sender", "fullName email")
    .populate("receiver", "fullName email")
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    user: { _id: user._id, fullName: user.fullName, email: user.email,role :user.role, },
    wallet: { currency: "EUR", balance: user.balanceEUR },
    transactions,
  });
});

module.exports = { getDashboard };
