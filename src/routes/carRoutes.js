const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const carController = require("../controllers/carController");

// Только после логина
router.get("/search", protect, carController.search);
router.get("/:trimId", protect, carController.details);

module.exports = router;
