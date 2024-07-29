const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { PermissionsBitField } = require('discord.js');
const User = require('../../schemas/user'); // Adjust the path as needed

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeverification')
    .setDescription('Remove the verification status from a specified user.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addUserOption(option => 
      option.setName('user')
        .setDescription('User to remove verification from')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    // Check if the user executing the command is an admin
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('user'); // Get the specified user
    if (!user) {
      return interaction.reply({
        content: 'User not found.',
        ephemeral: true,
      });
    }

    // Update the user's verification status in the database
    try {
      const updatedUser = await User.findOneAndUpdate(
        { userId: user.id },
        { $unset: { isVerified: "" } }, // Remove the `isVerified` field
        { new: true }
      );

      if (!updatedUser) {
        return interaction.reply({
          content: 'User not found in the database.',
          ephemeral: true,
        });
      }

      return interaction.reply({
        content: `Verification status has been removed from ${user.tag}.`,
        ephemeral: true,
      });
    } catch (error) {
      consola.error(c.red('Error removing verification status:' + error));
      return interaction.reply({
        content: 'There was an error while trying to remove the verification status.',
        ephemeral: true,
      });
    }
  },
};
