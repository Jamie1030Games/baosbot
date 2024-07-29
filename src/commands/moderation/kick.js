const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
    .addUserOption(option => 
      option
        .setName('user')
        .setDescription('User to kick')
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName('reason')
        .setDescription('Reason for the kick')
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // Check if the user has the right permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    try {
      // Kick the user
      await interaction.guild.members.kick(user.id, { reason });

      // Respond with a success message
      return interaction.reply({ content: `Successfully kicked ${user.tag}. Reason: ${reason}`, ephemeral: true });
    } catch (error) {
      consola.error(c.red('Error kicking user:' + error));
      return interaction.reply({ content: 'There was an error while trying to kick the user.', ephemeral: true });
    }
  },
};
