const User = require("../models/User");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    res.json(user);
  } catch (e) { next(e); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (e) { next(e); }
};
