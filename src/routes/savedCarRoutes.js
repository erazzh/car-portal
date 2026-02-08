const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const c = require("../controllers/savedCarController");

router.post("/", protect, c.create);
router.get("/", protect, c.list);
router.get("/:id", protect, c.getOne);
router.put("/:id", protect, c.update);
router.delete("/:id", protect, c.remove);

module.exports = router;
