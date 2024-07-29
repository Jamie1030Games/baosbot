const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Item = require('../../schemas/item');
const User = require('../../schemas/user');
const Guild = require('../../schemas/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleteitems')
    .setDescription('Delete all items from the shop and from users (Admin only)')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  async execute(interaction) {
    let existingGuild = await Guild.findOne({ guildId: interaction.guild.id });
    try {
      if (!existingGuild) {
        const newGuild = new Guild({
          guildId: interaction.guild.id,
          config: {
            embedColor: "#FFFFFF", // Default color
          },
        });

        await newGuild.save();
      }
    } catch (error) {
      consola.error(c.red(`Error adding guild to the database:`, error));
    }
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
      .setColor(existingGuild.config.embedColor)
      .setTitle('All Items Deleted')
      .setDescription('All items have been deleted from the shop and from all users.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
