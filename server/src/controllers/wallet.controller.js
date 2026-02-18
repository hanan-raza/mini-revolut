// src/controllers/wallet.controller.js
const walletService = require("../services/wallet.service");

async function getBalance(req, res, next) {
  try {
    const balance = await walletService.getBalance(req.user._id);
    res.json({ currency: "EUR", balance });
  } catch (err) {
    next(err);
  }
}

async function deposit(req, res, next) {
  try {
    const balance = await walletService.deposit(req.user._id, req.body.amount);
    res.json({ balance });
  } catch (err) {
    next(err);
  }
}

async function withdraw(req, res, next) {
  try {
    const balance = await walletService.withdraw(req.user._id, req.body.amount);
    res.json({ balance });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBalance, deposit, withdraw };
