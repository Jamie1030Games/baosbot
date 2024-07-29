const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const User = require('../../schemas/user');
const Guild = require('../../schemas/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetdaily')
    .setDescription('Reset the daily cooldown for a specific user')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user whose daily cooldown you want to reset')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Fetch the guild configuration
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

    // Get the user to reset
    const targetUser = interaction.options.getUser('user');
    const user = await User.findOne({ userId: targetUser.id });

    if (!user) {
      return interaction.reply({
        content: 'User not found in the database.',
        ephemeral: true,
      });
    }

    // Calculate the new `lastDaily` timestamp to bypass the 24-hour threshold
    const now = Date.now();
    const timeUntilNextDaily = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const newLastDaily = now - (timeUntilNextDaily - 1000); // Set to just below the threshold

    user.dailies.lastDaily = newLastDaily;
    await user.save();

    // Create the response embed
    const embed = new EmbedBuilder()
      .setColor(existingGuild.config.embedColor)
      .setTitle('Daily Reset')
      .setDescription(`The daily cooldown for ${targetUser.username} has been reset. They can now claim their daily reward immediately.`)
      .setTimestamp();

    // Send the embed
    await interaction.reply({ embeds: [embed] });
  },
};
