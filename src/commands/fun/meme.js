const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme'),

  async execute(interaction) {
    const url = 'https://meme-api.com/gimme';

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.url) {
        return interaction.reply('Could not fetch a meme.');
      }

      const embed = new EmbedBuilder()
        .setTitle(data.title)
        .setImage(data.url)
        .setColor('#ffcc00')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching meme:', error);
      await interaction.reply('An error occurred while fetching a meme.');
    }
  },
};
