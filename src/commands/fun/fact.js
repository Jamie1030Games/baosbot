const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // Ensure you have 'node-fetch' installed

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fact')
    .setDescription('Get a random fact'),

  async execute(interaction) {
    const url = 'https://uselessfacts.jsph.pl/random.json?language=en';

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const fact = data.text;

      if (!fact) throw new Error('Fact not found');

      const embed = new EmbedBuilder()
        .setTitle('Random Fact')
        .setDescription(fact)
        .setColor('#0099ff')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching fact:', error);
      await interaction.reply('Failed to fetch a fact. Please try again later.');
    }
  },
};
