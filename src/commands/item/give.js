const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Item = require('../../schemas/item');
const User = require('../../schemas/user');
const convertMilliseconds = require('../../functions/converters/convertMilliseconds.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveitem')
    .setDescription('Give an item to a user')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addStringOption(option =>
      option.setName('itemname')
        .setDescription('The name of the item to give')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to give the item to')
        .setRequired(true)
    ),
  async execute(interaction) {
    const itemName = interaction.options.getString('itemname');
    const targetUser = interaction.options.getUser('user');

    try {
      // Fetch the item from the item database
      const item = await Item.findOne({ name: itemName });
      if (!item) {
        return interaction.reply(`Item \`${itemName}\` not found in the database.`);
      }

      // Fetch the user from the user database
      let user = await User.findOne({ userId: targetUser.id });
      if (!user) {
        // Create a new user if they don't exist in the database
        user = new User({
          userId: targetUser.id,
          coins: 0,
          items: []
        });
      }

      // Check if user already has 3 items
      if (user.items.length >= 3) {
        return interaction.reply({
          content: `${targetUser.username} cannot have more than 3 items.`,
          ephemeral: true,
        });
      }

      const expirationDate = item.expirationDuration
        ? Date.now() + item.expirationDuration
        : null;

      const newItem = {
        name: item.name,
        description: item.description,
        multiplier: item.multiplier,
        luckboost: item.luckBoost,
        type: item.type,
        expirationDate,
      };

      if (item.type === 'coin_multiplier') {
        newItem.multiplier = item.multiplier;
      } else if (item.type === 'luck_booster') {
        newItem.luckboost = item.luckboost;
      }

      user.items.push(newItem);
      await user.save();

      // Send a confirmation message
      const confirmationEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Item Given')
        .setDescription(`You have given **${item.name}** to **${targetUser.username}**!`)
        .addFields(
          { name: 'Effect', value: item.description || 'No effect' },
          { name: 'Expiration', value: convertMilliseconds(item.expirationDuration) || 'Never' }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [confirmationEmbed] });
    } catch (error) {
      console.error('Error giving item:', error);
      await interaction.reply({
        content: 'An error occurred while giving the item.',
        ephemeral: true,
      });
    }
  },
};
