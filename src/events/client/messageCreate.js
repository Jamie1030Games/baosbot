const mongoose = require("mongoose");
const UserSchema = require("../../schemas/user"); // Adjust the path as necessary
const canvafy = require("canvafy");
const Guild = require("../../schemas/guild");
const { ChannelType } = require("discord.js");

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
        console.log(`Guild ${message.guild.id} added to the database.`);
      }
    } catch (error) {
      console.error(`Error adding guild to the database:`, error);
    }
    try {
      // Ensure that UserSchema is correctly defined
      if (!UserSchema || !UserSchema.findOne) {
        console.error("UserSchema is not correctly defined or imported.");
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
        if (existingGuild.config.levelEnabled == 'true') {
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
              user.level += 1;
              user.xp -= nextLevelXP; // Handle XP overflow

              // Grant coins based on the total XP required for that level
              user.coins += nextLevelXP;

              await user.save();

              // Create and send the embed message
              // const levelUpEmbed = new EmbedBuilder()
              //   .setColor('#FFD700') // Gold color
              //   .setTitle('🎉 Level Up! 🎉')
              //   .setDescription(`Congratulations ${message.author}, you have leveled up!`)
              //   .addFields(
              //     { name: 'New Level', value: user.level.toString(), inline: true },
              //     { name: 'XP Until Next Level', value: (calculateXpForNextLevel(user.level) - user.xp).toString(), inline: true },
              //     { name: 'Coins Earned', value: nextLevelXP.toString(), inline: true }
              //   )
              //   .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
              //   .setFooter({ text: 'Keep chatting to earn more XP and level up even further!' })
              //   .setTimestamp();

              const userStatus = message.member.presence?.status || "offline";

              const levelUpEmbed = await new canvafy.Rank()
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
                .setBorder("#fff")
                .setStatus(userStatus)
                .setLevel(user.level)
                .setCurrentXp(user.xp)
                .setRequiredXp(nextLevelXP + 20)
                .build();

              if (existingGuild.config.levelChannel && existingGuild.config.levelChannel != '0' && existingGuild.config.levelChannel != undefined && existingGuild.config.levelChannel != null) {
                const levelChannel = client.channels.cache.get(existingGuild.config.levelChannel);
                await levelChannel.send({
                  content: `<@${message.author.id}> has leveled up!`,
                  files: [
                    {
                      attachment: levelUpEmbed,
                      name: `rank-${message.member.id}.png`,
                    },
                  ],
                });
              } else if (existingGuild.config.levelChannel == '0') {
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

            console.log(
              `User ${message.author.tag} has ${user.xp} XP in total. This level takes ${nextLevelXP}.`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error updating XP:", error);
    }
  },
};
