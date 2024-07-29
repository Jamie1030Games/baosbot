const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { EmbedBuilder } = require('discord.js');
const Guild = require('../../schemas/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to get information about')
    ),

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

    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const userInfoEmbed = new EmbedBuilder()
      .setColor(existingGuild.config.embedColor || "#FFFFFF")
      .setTitle(`Information about ${user.tag}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'Username', value: user.username, inline: true },
        { name: 'Joined Server At', value: member ? member.joinedAt.toDateString() : 'N/A', inline: true },
        { name: 'Account Created At', value: user.createdAt.toDateString(), inline: true }
      )
      .setFooter({ text: `ID: ${user.id}` });

    return interaction.reply({ embeds: [userInfoEmbed] });
  },
};
