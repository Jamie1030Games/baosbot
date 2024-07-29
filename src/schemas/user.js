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
        enum: ["coin_multiplier", "luck_booster", "no_tax", "other"],
        required: true,
      },
      notaxAmt: { type: Number, default: '0' },
      luckboost: String,
      expirationDate: Date,
      isUnique: { type: String, default: 'false' },
    },
  ],
  lastDaily: { type: Number, default: 86400000 },
  job: {
    jobType: {
      type: String,
      default: 'none',
    },
    workExperience: {
      type: Number,
      default: 0,
    },
  }
});

module.exports = mongoose.model("User", userSchema);
