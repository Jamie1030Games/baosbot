const mongoose = require("mongoose");
const UserSchema = require("../../schemas/user"); // Adjust the path as necessary
const canvafy = require("canvafy");
const Guild = require("../../schemas/guild");
const { ChannelType } = require("discord.js");
const { consola } = require("consola");
const c = require('ansi-colors');

const XP_AMOUNT = 10; // Amount of XP to add per message
const COOLDOWN = 0.000001 * 1000; // Cooldown period in milliseconds (5 seconds)

// Function to calculate XP needed for the next level
const calculateXpForNextLevel = (level) => {
  return level * 20 + 30; // XP needed for the next level increases by 20 per level
};

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (!message || !message.author) return; // Ignore invalid messages
    if (message.author.bot) return; // Ignore bot messages
    if (message.channel.type === ChannelType.DM) return;

    const userId = message.author.id;
    const now = Date.now();
    let existingGuild = await Guild.findOne({ guildId: message.guild.id });
    try {
      if (!existingGuild) {
        const newGuild = new Guild({
          guildId: message.guild.id,
          config: {
            embedColor: "#FFFFFF", // Default color
          },
        });

        await newGuild.save();
      }
    } catch (error) {
      consola.error(c.red(`Error adding guild to the database:`, error));
    }
    try {
      // Ensure that UserSchema is correctly defined
      if (!UserSchema || !UserSchema.findOne) {
        consola.error(c.red("UserSchema is not correctly defined or imported."));
        return;
      }

      // Find or create a user in the database
      let user = await UserSchema.findOne({ userId });

      if (!user) {
        user = new UserSchema({
          _id: new mongoose.Types.ObjectId(),
          userId,
          coins: 0,
          level: 1,
          xp: 0,
          lastMessageTimestamp: now,
        });
        await user.save();
      } else {
        if (existingGuild.config.levelEnabled == "true") {
          const lastMessageTimestamp = user.lastMessageTimestamp || 0;

          // Check if the cooldown period has passed
          if (now - lastMessageTimestamp >= COOLDOWN) {
            // Update XP and last message timestamp
            user.xp += XP_AMOUNT;
            user.lastMessageTimestamp = now;

            // Calculate XP needed for next level
            let nextLevelXP = calculateXpForNextLevel(user.level);

            // Handle leveling up
            if (user.xp >= nextLevelXP) {
              let currentUserLevel = user.level;
              user.level += 1;
              user.xp -= nextLevelXP; // Handle XP overflow

              // Grant coins based on the total XP required for that level
              user.coins += nextLevelXP;

              await user.save();

              const levelUpEmbed = await new canvafy.LevelUp()
                .setAvatar(
                  message.author.displayAvatarURL({
                    forceStatic: true,
                    extension: "png",
                  })
                )
                .setBackground(
                  "image",
                  "https://www.designyourway.net/blog/wp-content/uploads/2018/11/pastel-background-goo-1536x864.jpg"
                )
                .setUsername(message.author.username)
                .setBorder(existingGuild.config.embedColor)
                .setAvatarBorder(existingGuild.config.embedColor)
                .setOverlayOpacity(0.7)
                .setLevels(currentUserLevel, user.level)
                .build();

              // const userStatus = message.member.presence?.status || "offline";

              // const levelUpEmbed = await new canvafy.Rank()
              //   .setAvatar(
              //     message.author.displayAvatarURL({
              //       forceStatic: true,
              //       extension: "png",
              //     })
              //   )
              //   .setBackground(
              //     "image",
              //     "https://www.designyourway.net/blog/wp-content/uploads/2018/11/pastel-background-goo-1536x864.jpg"
              //   )
              //   .setUsername(message.author.username)
              //   .setBorder("#fff")
              //   .setStatus(userStatus)
              //   .setLevel(user.level)
              //   .setCurrentXp(user.xp)
              //   .setRequiredXp(nextLevelXP + 20)
              //   .build();

              if (
                existingGuild.config.levelChannel &&
                existingGuild.config.levelChannel != "0" &&
                existingGuild.config.levelChannel != undefined &&
                existingGuild.config.levelChannel != null
              ) {
                const levelChannel = client.channels.cache.get(
                  existingGuild.config.levelChannel
                );
                await levelChannel.send({
                  content: `<@${message.author.id}> has leveled up!`,
                  files: [
                    {
                      attachment: levelUpEmbed,
                      name: `rank-${message.member.id}.png`,
                    },
                  ],
                });
              } else if (existingGuild.config.levelChannel == "0") {
                await message.channel.send({
                  content: `<@${message.author.id}> has leveled up!`,
                  files: [
                    {
                      attachment: levelUpEmbed,
                      name: `rank-${message.member.id}.png`,
                    },
                  ],
                });
              }
            } else {
              await user.save(); // Save updated user data if no level up
            }
          }
        }
      }
    } catch (error) {
      consola.error(c.red("Error updating XP:" + error));
    }
  },
};
