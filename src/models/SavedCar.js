const mongoose = require("mongoose");

const savedCarSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    query: { type: String, required: true },
    trimId: { type: Number, required: true }, // CarAPI trim "id"
    title: { type: String, required: true },
    year: { type: Number, required: true },

    imageUrl: { type: String, required: true },
    estimatedPrice: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavedCar", savedCarSchema);
