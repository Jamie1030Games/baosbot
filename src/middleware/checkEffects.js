// middleware/checkEffects.js
const User = require('../schemas/user');

module.exports = async (interaction, next) => {
  const user = await User.findOne({ userId: interaction.user.id });
  if (user) {
    const now = Date.now();

    user.items = user.items.filter(item => {
      if (item.expirationDate && item.expirationDate < now) {
        return false;
      }
      if (item.effect === 'coinMultiplier') {
        interaction.coinMultiplier = item.value;
      } else if (item.effect === 'luckBooster') {
        interaction.luckBooster = true;
      }
      return true;
    });

    await user.save();
  }
  next();
};
