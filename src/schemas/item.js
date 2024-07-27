// schemas/item.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  expirationDuration: { type: Number, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['coin_multiplier', 'luck_booster', 'other'], required: true },
  multiplier: { type: Number, default: 1 },
  luckBoost: { type: Number, default: 0 }
});

module.exports = mongoose.model("Item", itemSchema);
