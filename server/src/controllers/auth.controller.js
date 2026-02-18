// src/controllers/auth.controller.js
const User = require("../models/User");
const authService = require("../services/auth.service");

async function register(req, res) {
  const { fullName, email, password } = req.body;

  const normalizedEmail = authService.normalizeEmail(email);

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await authService.hashPassword(password);

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    passwordHash,
    balanceEUR: 1000,
  });

  const token = authService.signToken(user._id);

  res.status(201).json({
    token,
    user: { id: user._id, fullName: user.fullName, email: user.email, balanceEUR: user.balanceEUR },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const normalizedEmail = authService.normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await authService.comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = authService.signToken(user._id);

  res.json({
    token,
    user: { id: user._id, fullName: user.fullName, email: user.email, balanceEUR: user.balanceEUR,
     },
  });
}

module.exports = { register, login };
