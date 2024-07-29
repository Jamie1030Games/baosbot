const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
    .addUserOption(option => 
      option
        .setName('user')
        .setDescription('User to ban')
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName('reason')
        .setDescription('Reason for the ban')
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // Check if the user has the right permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    try {
      // Ban the user
      await interaction.guild.members.ban(user.id, { reason });

      // Respond with a success message
      return interaction.reply({ content: `Successfully banned ${user.tag}. Reason: ${reason}`, ephemeral: true });
    } catch (error) {
      consola.error(c.red('Error banning user:' + error));
      return interaction.reply({ content: 'There was an error while trying to ban the user.', ephemeral: true });
    }
  },
};
