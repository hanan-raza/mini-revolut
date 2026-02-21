// src/controllers/auth.controller.js
const User = require("../models/User");
const authService = require("../services/auth.service");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    user: { id: user._id, fullName: user.fullName, email: user.email, balanceEUR: user.balanceEUR },
  });
}
async function googleLogin(req, res) {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: "Missing credential" });

  try {
    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    // Detailed logging to help debug 401 errors
    console.log("Google payload:", {
      email: payload?.email,
      email_verified: payload?.email_verified,
      aud: payload?.aud,
      sub: payload?.sub,
      name: payload?.name,
    });

    const email = authService.normalizeEmail(payload?.email); 
    const emailVerified = payload?.email_verified;
    const fullName = payload?.name || "Google User";
    const googleSub = payload?.sub;

    if (!email || !emailVerified) {
      return res.status(401).json({ message: "Google account email not verified" });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName,
        email,
        authProvider: "google",
        googleSub,
        balanceEUR: 1000, 
      });
    } else {
      // Link googleSub if the user existed via local login previously
      if (!user.googleSub) {
        user.googleSub = googleSub;
        user.authProvider = user.authProvider || "google";
        await user.save();
      }
    }

    // Issue YOUR JWT using your service helper
    const token = authService.signToken(user._id);
    
    return res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        balanceEUR: user.balanceEUR,
      },
    });
  } catch (error) {
    // Log the exact error message from the Google library
    console.error("verifyIdToken failed:", error?.message || error);
    return res.status(401).json({ message: "Invalid Google token" });
  }
}

module.exports = { register, login, googleLogin };