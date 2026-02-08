const router = require("express").Router();
const Joi = require("joi");
const validate = require("../middleware/validate");
const c = require("../controllers/authController");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required()
});

router.post("/register", validate(registerSchema), c.register);
router.post("/login", validate(loginSchema), c.login);

module.exports = router;
