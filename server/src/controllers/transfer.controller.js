const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const txService = require("../services/transaction.service");
const { TX_STATUS } = require("../utils/constants");
async function transfer(req, res) {
  const { recipientEmail, amount } = req.body;

  const amt = Number(amount);

  const senderId = req.user._id;

  const sender = await User.findById(senderId).select("_id email");
  if (!sender) return res.status(401).json({ message: "Unauthorized" });
  if (sender.email === recipientEmail.toLowerCase()) {
    return res.status(400).json({ message: "Cannot transfer to yourself" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const senderDoc = await User.findById(senderId).session(session);
    const receiverDoc = await User.findOne({ email: recipientEmail.toLowerCase() }).session(session);

    if (!receiverDoc) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (senderDoc.balanceEUR - amt < 0) {
      await txService.logTransfer(
       senderId,
       receiverDoc._id,
       amt,
       TX_STATUS.FAILED,
      session
);

      await session.commitTransaction();
      return res.status(400).json({ message: "Insufficient funds" });
    }

    senderDoc.balanceEUR -= amt;
    receiverDoc.balanceEUR += amt;

    await senderDoc.save({ session });
    await receiverDoc.save({ session });

    const tx = await txService.logTransfer(
       senderDoc._id,
       receiverDoc._id,
        amt,
       TX_STATUS.COMPLETED,
       session
);

    await session.commitTransaction();

    return res.json({
      message: "Transfer completed",
      transaction: tx[0],
      senderBalance: senderDoc.balanceEUR,
    });
  } catch (err) {
    await session.abortTransaction();
    return res.status(500).json({ message: "Transfer failed" });
  } finally {
    session.endSession();
  }
}

module.exports = { transfer };
