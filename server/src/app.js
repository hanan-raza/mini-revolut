require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const walletRoutes = require("./routes/wallet.routes");
const authRoutes = require("./routes/auth.routes");
const transferRoutes = require("./routes/transfer.routes");
const transactionsRoutes = require("./routes/transactions.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: [
      process.env.CLIENT_ORIGIN,
      "https://mini-revolut.vercel.app",
      "http://localhost:5173",
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ REMOVED: app.options("*", cors());  // This crashes on Render (path-to-regexp error)

app.use(express.json());
app.use(morgan("dev"));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Mini Revolut API running" });
});

app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/wallet", walletRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
