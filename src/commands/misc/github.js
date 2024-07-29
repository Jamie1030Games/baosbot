const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Guild = require('../../schemas/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('Sends the link to the GitHub repository'),
  async execute(interaction) {
    try {
      // Fetch the guild config
      const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });

      if (!guildConfig) {
        return interaction.reply({
          content: 'Guild configuration not found.',
          ephemeral: true,
        });
      }

      const embedColor = guildConfig.config.embedColor || '#00FF00'; // Default to green if not set

      const githubEmbed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('GitHub Repository')
        .setDescription('Check out the source code on GitHub!')
        .setURL('https://github.com/Jamie1030Games/baosbot/tree/main')
        .setFooter({ text: 'Click the title to visit the repository' });

      await interaction.reply({ embeds: [githubEmbed] });
    } catch (error) {
      console.error('Error fetching guild config or sending embed:', error);
      await interaction.reply({
        content: 'An error occurred while processing your request.',
        ephemeral: true,
      });
    }
  },
};
