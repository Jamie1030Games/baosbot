// In schemas/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: String,
  isVerified: {
   type: String,
   default: 'false',
  },
  coins: Number,
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  lastMessageTimestamp: Number,
  items: [
    {
      name: String,
      description: String,
      multiplier: String,
      type: {
        type: String,
        enum: ["coin_multiplier", "luck_booster", "other"],
        required: true,
      },
      luckboost: String,
      expirationDate: Date,
    },
  ],
  lastDaily: { type: Number, default: 86400000 },
});

module.exports = mongoose.model("User", userSchema);
