// src/commands/tools/level.js
const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const canvafy = require("canvafy");
const mongoose = require("mongoose");
const UserSchema = require("../../schemas/user.js"); // Adjust the path as needed
const Guild = require("../../schemas/guild.js"); // Adjust the path as needed

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Display your level and XP information"),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      // Fetch user data from the database
      let user = await UserSchema.findOne({ userId });

      if (!user) {
        // If user data is not found, create a new entry
        user = new UserSchema({
          _id: new mongoose.Types.ObjectId(),
          userId,
          coins: 0,
          level: 1,
          xp: 0,
        });
        await user.save();
      }

      const xpNeeded = user.level * 20; // XP needed for next level
      const xpRemaining = xpNeeded - user.xp; // XP remaining to level up

      // Fetch embed color from the database
      const guild = await Guild.findOne({ guildId: interaction.guildId });

      // const embed = new EmbedBuilder()
      //   .setColor(embedColor)
      //   .setTitle(`🌟 ${interaction.user.username}'s Level`)
      //   .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      //   .setDescription('Here is your current level and XP status:')
      //   .addFields(
      //     { name: 'Level', value: `${user.level}`, inline: true },
      //     { name: 'XP', value: `${user.xp}/${xpNeeded}`, inline: true },
      //     { name: 'XP until next level', value: `${xpRemaining}`, inline: true }
      //   )
      //   .setFooter({ text: 'Keep chatting to level up!', iconURL: interaction.client.user.displayAvatarURL() })
      //   .setTimestamp();
      const userStatus = interaction.member.presence?.status || "offline";

      const levelUpEmbed = await new canvafy.Rank()
        .setAvatar(
          interaction.user.displayAvatarURL({
            forceStatic: true,
            extension: "png",
          })
        )
        .setBackground(
          "image",
          "https://www.designyourway.net/blog/wp-content/uploads/2018/11/pastel-background-goo-1536x864.jpg"
        )
        .setUsername(interaction.user.username)
        .setBorder("#fff")
        .setStatus(userStatus)
        .setBarColor(guild.config.embedColor)
        .setLevel(user.level) 
        .setCurrentXp(xpRemaining)
        .setRequiredXp(xpNeeded + 20)
        .build();

      await interaction.reply({
        files: [
          {
            attachment: levelUpEmbed,
            name: `rank-${interaction.user.id}.png`,
          },
        ],
      });
    } catch (error) {
      consola.error(c.red('Error fetching level data:' + error));
      await interaction.reply({
        content:
          "An error occurred while fetching your level data. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
