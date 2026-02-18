// src/services/transaction.service.js
const Transaction = require("../models/Transaction");
const { TX_STATUS, TX_TYPE, CURRENCY } = require("../utils/constants");

function logDeposit(userId, amount) {
  return Transaction.create({
    type: TX_TYPE.DEPOSIT,
    receiver: userId,
    amount,
    currency: CURRENCY.EUR,
    status: TX_STATUS.COMPLETED,
  });
}

function logWithdrawal(userId, amount) {
  return Transaction.create({
    type: TX_TYPE.WITHDRAWAL,
    sender: userId,
    amount,
    currency: CURRENCY.EUR,
    status: TX_STATUS.COMPLETED,
  });
}

function logTransfer(senderId, receiverId, amount, status, session) {
  const doc = {
    type: TX_TYPE.TRANSFER,
    sender: senderId,
    receiver: receiverId,
    amount,
    currency: CURRENCY.EUR,
    status,
  };

  if (session) {
    return Transaction.create([doc], { session });
  }

  return Transaction.create(doc);
}

module.exports = { logDeposit, logWithdrawal, logTransfer };
