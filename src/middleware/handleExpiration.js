const User = require("../schemas/user");
const consola = require("consola");
const c = require("ansi-colors");

const handleExpiration = async (userId, item) => {
  const expirationDate = item.expirationDuration
    ? Date.now() + item.expirationDuration
    : null;

  if (expirationDate) {
    setTimeout(async () => {
      try {
        const updatedUser = await User.findOne({ userId });

        if (updatedUser) {
          updatedUser.items = updatedUser.items.filter((userItem) =>
            userItem.expirationDate
              ? userItem.expirationDate > Date.now()
              : true
          );

          // Remove the item from the database if expired
          await User.updateOne(
            { userId },
            {
              $pull: {
                items: { expirationDate: { $lt: Date.now() } },
              },
            }
          );

          await updatedUser.save();
        }
      } catch (error) {
        consola.error(c.red("Error removing expired item:" + error));
      }
    }, item.expirationDuration);
  }
};

module.exports = handleExpiration;
