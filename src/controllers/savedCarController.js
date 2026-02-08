const SavedCar = require("../models/SavedCar");

exports.create = async (req, res, next) => {
  try {
    const doc = await SavedCar.create({ ...req.body, user: req.user.id });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const items = await SavedCar.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await SavedCar.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await SavedCar.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await SavedCar.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};
