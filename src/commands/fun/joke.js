const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke'),

  async execute(interaction) {
    const url = 'https://official-joke-api.appspot.com/random_joke';

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.setup) {
        return interaction.reply('Could not fetch a joke.');
      }

      const embed = new EmbedBuilder()
        .setTitle('Here\'s a joke for you!')
        .setDescription(`${data.setup}\n\n*${data.punchline}*`)
        .setColor('#ff9900')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching joke:', error);
      await interaction.reply('An error occurred while fetching a joke.');
    }
  },
};
