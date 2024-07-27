const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Item = require('../../schemas/item');
const User = require('../../schemas/user');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleteitems')
    .setDescription('Delete all items from the shop and from users (Admin only)')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  async execute(interaction) {
    // Delete all items from the shop
    await Item.deleteMany({});

    // Fetch all users
    const users = await User.find();

    // Remove all items from each user
    for (const user of users) {
      user.items = [];
      await user.save();
    }

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('All Items Deleted')
      .setDescription('All items have been deleted from the shop and from all users.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
