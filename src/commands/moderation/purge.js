const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js'); // Ensure correct import

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete a specified number of messages from the channel')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .addIntegerOption(option => 
      option
        .setName('amount')
        .setDescription('Number of messages to delete')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    // Check if the user has the right permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    // Fetch the channel from the interaction
    const channel = interaction.channel;

    try {
      // Fetch messages
      const messages = await channel.messages.fetch({ limit: amount });

      // Bulk delete messages
      await channel.bulkDelete(messages, true);

      // Respond with a success message
      return interaction.reply({ content: `Successfully deleted ${amount} message(s).`, ephemeral: true });
    } catch (error) {
      console.error('Error deleting messages:', error);
      return interaction.reply({ content: 'There was an error while trying to delete messages.', ephemeral: true });
    }
  },
};
