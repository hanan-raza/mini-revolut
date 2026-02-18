function notFound(req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  // Avoid leaking internal details in production
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Server error"
      : err.message || "Server error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
