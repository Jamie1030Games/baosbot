// schemas/item.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  expirationDuration: { type: Number, required: true },
  price: { type: Number, required: true },
  type: {
    type: String,
    enum: ["coin_multiplier", "luck_booster", "no_tax", "other"],
    required: true,
  },
  multiplier: { type: Number, default: 1 },
  luckBoost: { type: Number, default: 0 },
  notaxAmt: { type: Number, default: 0 },
  isOffSale: { type: String, default: "false" },
  deal: {
    percentOff: { type: String, default: '0' },
    hasDeal: { type: String, default: "false" },
  },
  limit: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Item", itemSchema);
