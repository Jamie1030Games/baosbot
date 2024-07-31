const User = require("../schemas/user");
const Item = require("../schemas/item");

const checkItemLimit = async (userId, itemName) => {
  const user = await User.findOne({ userId });
  const item = await Item.findOne({ name: itemName });

  if (!user || !item) return false;

  const limit = item.limit;
  const userItemCount = user.items.filter(item => item.name === itemName).length;

  if (limit && userItemCount >= limit && limit >= 1) {
    return true;
  }

  return false;
};

module.exports = checkItemLimit;
