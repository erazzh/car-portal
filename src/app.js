const path = require("path");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const savedCarRoutes = require("./routes/savedCarRoutes");
const carRoutes = require("./routes/carRoutes");

const app = express();

app.use(helmet());
app.use(cors()); // фронт будет отдельной папкой client
app.use(express.json());

app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/saved-cars", savedCarRoutes);
app.use("/api/cars", carRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../../client")));

// Default route -> landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/index.html"));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
