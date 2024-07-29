const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const User = require('../../schemas/user'); // Adjust path as needed
const Item = require('../../schemas/item'); // Adjust path as needed

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeitem')
    .setDescription('Remove an item from your inventory and the global database')
    .addStringOption(option =>
      option
        .setName('itemname')
        .setDescription('The name of the item to remove')
        .setRequired(true)
    ),

  async execute(interaction) {
    const itemName = interaction.options.getString('itemname');

    try {
      // Fetch the user from the database
      const user = await User.findOne({ userId: interaction.user.id });
      if (!user) {
        return interaction.reply({
          content: 'User not found in the database.',
          ephemeral: true,
        });
      }

      // Remove the item from the user's inventory
      const itemIndex = user.items.findIndex(item => item.name === itemName);
      if (itemIndex === -1) {
        return interaction.reply({
          content: 'Item not found in your inventory.',
          ephemeral: true,
        });
      }
      user.items.splice(itemIndex, 1);

      // Remove the item from the item database
      await Item.deleteOne({ name: itemName });

      // Save the updated user document
      await user.save();

      return interaction.reply({
        content: `Successfully removed the item: ${itemName} from your inventory and the global database.`,
        ephemeral: true,
      });
    } catch (error) {
      consola.error(c.red('Error removing item:' + error));
      return interaction.reply({
        content: 'An error occurred while removing the item.',
        ephemeral: true,
      });
    }
  },
};
