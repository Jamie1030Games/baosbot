const User = require('../schemas/user'); // Adjust the path to your schema
async function handleLuck(userId, baseAmount) {
  const user = await User.findOne({ userId });
  
  if (!user) {
    throw new Error('User not found');
  }

  let finalAmount = baseAmount;

  // Find active luck boost
  const activeItem = user.items.find(item => item.type === 'luck_booster' && item.expirationDate > Date.now());

  if (activeItem) {
    const luckBoostPercentage = parseFloat(activeItem.luckboost) || 0;
    finalAmount += (finalAmount * (luckBoostPercentage / 100));
  }

  return finalAmount;
}

module.exports = handleLuck;
