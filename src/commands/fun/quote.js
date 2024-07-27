const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Get a random quote'),

  async execute(interaction) {
    const url = 'https://api.quotable.io/random'; // Quotable API endpoint

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Text: ${errorText}`);
      }

      const data = await response.json();
      const quote = data.content;
      const author = data.author;

      if (!quote || !author) throw new Error('Quote or author not found');

      const embed = new EmbedBuilder()
        .setTitle('Random Quote')
        .setDescription(`"${quote}"`)
        .setFooter(`- ${author}`)
        .setColor('#0099ff')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching quote:', error.message);
      await interaction.reply('Failed to fetch a quote. Please try again later.');
    }
  },
};
