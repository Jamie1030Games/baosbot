// functions/handleCoins.js
const User = require("../schemas/user");

async function handleCoins(userId, baseAmount) {
  try {
    // Fetch user data
    let user = await User.findOne({ userId: userId });

    if (!user) {
      user = new User({
        userId: userId,
        coins: 0,
        lastDaily: Date.now(),
        xp: 0,
        lastMessageTimestamp: Date.now(),
      });
    }

    // Calculate the multiplier effect
    let multiplier = 1;
    if (user.items && user.items.length > 0) {
      user.items.forEach((item) => {
        if (
          item.type === "coin_multiplier" &&
          item.expirationDate > Date.now()
        ) {
          multiplier *= parseFloat(item.multiplier) || 1;
        }
      });
    }

    // Calculate the final amount after applying multipliers
    const finalAmount = baseAmount * multiplier;

    return finalAmount;
  } catch (error) {
    console.error("Error handling coin calculation:", error.message);
    throw error;
  }
}

module.exports = handleCoins;
