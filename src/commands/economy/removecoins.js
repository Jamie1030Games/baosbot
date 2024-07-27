const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const User = require('../../schemas/user'); // Adjust the path as necessary

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removecoins')
    .setDescription('Remove coins from a user')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to remove coins from')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The amount of coins to remove')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return interaction.reply('The amount must be greater than zero.');
    }

    try {
      let user = await User.findOne({ userId: target.id });
      if (!user) {
        user = new User({ userId: target.id, coins: 0 });
      }
      if (user.coins < amount) {
        return interaction.reply('The user does not have enough coins to remove.');
      }
      user.coins -= amount;
      await user.save();

      const successEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Coins Removed')
        .setDescription(`Successfully removed ${amount} coins from ${target.username}.`)
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('Error removing coins:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('An error occurred while removing coins.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
