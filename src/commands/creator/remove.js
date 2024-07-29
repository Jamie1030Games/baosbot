const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const User = require("../../schemas/user");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removeplayeritem")
    .setDescription("Remove an item from a player's inventory.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User from whose inventory the item will be removed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the item to remove")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const itemName = interaction.options.getString("name");

    // Find the user document from the database
    const userDoc = await User.findOne({ userId: user.id });

    if (!userDoc) {
      return interaction.reply("User not found.");
    }

    // Check if the item exists in the user's inventory
    const itemIndex = userDoc.items.findIndex((item) => item.name === itemName);

    if (itemIndex === -1) {
      return interaction.reply("Item not found in the user's inventory.");
    }

    // Remove the item from the user's inventory
    userDoc.items.splice(itemIndex, 1);
    await userDoc.save();

    // Notify the admin about the removal
    await interaction.reply(
      `Item **${itemName}** has been removed from ${user.username}'s inventory.`
    );
  },
};
