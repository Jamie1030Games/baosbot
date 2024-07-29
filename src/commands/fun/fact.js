const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // Ensure you have 'node-fetch' installed
const Guild = require('../../schemas/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fact')
    .setDescription('Get a random fact'),

  async execute(interaction) {
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
        console.log(`Guild ${interaction.guild.id} added to the database.`);
      }
    } catch (error) {
      console.error(`Error adding guild to the database:`, error);
    }
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
        .setColor(existingGuild.config.embedColor)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching fact:', error);
      await interaction.reply('Failed to fetch a fact. Please try again later.');
    }
  },
};
