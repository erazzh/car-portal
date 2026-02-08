function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message || "Server error"
  });
}

module.exports = { notFound, errorHandler };
