const User = require("../schemas/user");

const addItemToUser = async (userId, item) => {
  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  const expirationDate = item.expirationDuration
    ? Date.now() + item.expirationDuration
    : null;

  const newItem = {
    name: item.name,
    description: item.description,
    type: item.type,
    expirationDate,
    limit: item.limit,
  };

  // Add dynamic properties based on item type
  const dynamicProperties = ["multiplier", "luckBoost", "notaxAmt", "other"];
  dynamicProperties.forEach((prop) => {
    if (item[prop] !== undefined) {
      newItem[prop] = item[prop];
    }
  });

  user.items.push(newItem);
  await user.save();
};

module.exports = addItemToUser;
