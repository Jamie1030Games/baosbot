const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { EmbedBuilder } = require('discord.js');
const Guild = require('../../schemas/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Send a virtual hug to someone')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to hug')
                .setRequired(true)),

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
        const target = interaction.options.getUser('target');
        const hugGIF = 'https://i.giphy.com/l8ooOxhcItowwLPuZn.webp'; // Example GIF URL

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} sends a hug to ${target.username}!`)
            .setImage(hugGIF)
            .setColor(existingGuild.config.embedColor);

        await interaction.reply({ embeds: [embed] });
    }
};
