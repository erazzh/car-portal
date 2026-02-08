const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const c = require("../controllers/userController");

router.get("/profile", protect, c.getProfile);
router.put("/profile", protect, c.updateProfile);

module.exports = router;
