const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { EmbedBuilder } = require('discord.js');
const Guild = require('../../schemas/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about the server'),

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

    const serverEmbed = new EmbedBuilder()
      .setColor(existingGuild.config.embedColor || "#FFFFFF")
      .setTitle(`Information about ${interaction.guild.name}`)
      .setThumbnail(interaction.guild.iconURL())
      .addFields(
        { name: 'Server Name', value: interaction.guild.name, inline: true },
        { name: 'Total Members', value: `${interaction.guild.memberCount}`, inline: true },
        { name: 'Created At', value: `${interaction.guild.createdAt.toDateString()}`, inline: true }
      )
      .setFooter({ text: `ID: ${interaction.guild.id}` });

    return interaction.reply({ embeds: [serverEmbed] });
  },
};
