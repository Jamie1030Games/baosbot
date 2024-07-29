const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const Guild = require('../../schemas/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme'),

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
      }
    } catch (error) {
      consola.error(c.red(`Error adding guild to the database:`, error));
    }
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
        .setColor(existingGuild.config.embedColor)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      consola.error(c.red('Error fetching meme:' + error));
      await interaction.reply('An error occurred while fetching a meme.');
    }
  },
};
