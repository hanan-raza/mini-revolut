require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

/* ==============================
   Fail Fast Security Checks
============================== */

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is required");
}

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
