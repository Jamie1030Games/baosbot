const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const User = require("../../schemas/user");
const canvafy = require("canvafy"); // Ensure canvafy is properly imported
const mongoose = require("mongoose");
const Guild = require('../../schemas/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("captcha")
    .setDescription("Verify your account!"),

  async execute(interaction, client) {
    let existingGuild = await Guild.findOne({ guildId: interaction.guild.id });
    let existingUser = await User.findOne({ userId: interaction.user.id });

    try {
      if (!existingUser) {
        existingUser = new User({
          _id: new mongoose.Types.ObjectId(),
          userId: interaction.user.id,
          coins: 0,
          level: 1,
          xp: 0,
          isVerified: "false",
        });
        await existingUser.save();
      }

      if (existingGuild.config.verifyEnabled == "true") {
        if (interaction.channel != existingGuild.config.verifyChannel) {
          return interaction.reply({
            content: `You must use this command in the verify channel.`,
          });
        }
        if (existingUser.isVerified == "true") {
          return interaction.reply({
            content: `You are already verified.`,
          });
        }
        const gChannel = existingGuild.config.verifyChannel;
        if (!gChannel) {
          await interaction.reply("Verification channel is not set.");
          return;
        }

        const channel = client.channels.cache.get(gChannel);
        if (!channel) {
          await interaction.reply("Channel not found.");
          return;
        }

        // Generate and send captcha to user
        const captchaData = canvafy.Util.captchaKey(15);
        const captchaImage = await new canvafy.Captcha()
          .setBackground(
            "image",
            "https://www.designyourway.net/blog/wp-content/uploads/2018/11/pastel-background-goo-1536x864.jpg"
          )
          .setCaptchaKey(captchaData)
          .setBorder("#f0f0f0")
          .setOverlayOpacity(0.7)
          .build();

        // Send captcha to user's DM
        await interaction.user
          .send({
            content: `Please solve the captcha to verify your account.`,
            files: [
              {
                attachment: captchaImage,
                name: `captcha-${interaction.user.id}.png`,
              },
            ],
          })
          .catch(console.error);

        await interaction.reply({
            content: "Verification sent to your DMs.",
            ephemeral: true,
        });

        // Handle user's response to the captcha
        const filter = (response) => response.author.id === interaction.user.id;
        const collected = await interaction.user.dmChannel
          .awaitMessages({
            filter,
            max: 1,
            time: 60000, // 1 minute to respond
            errors: ["time"],
          })
          .catch(() => null);

        if (!collected || !collected.first()) {
          await interaction.user.send(
            "No response received. Verification failed."
          );
          return;
        }

        const userCaptchaResponse = collected.first().content;
        if (userCaptchaResponse === captchaData) {
          await interaction.user.send("Correct. You may now access the server.");
          existingUser.isVerified = "true";
          const member = await interaction.guild.members.fetch(
            interaction.user.id
          );
          await member.roles.add(existingGuild.config.verifyRole);
          existingUser.save();
        } else {
          await interaction.user.send("Incorrect. Please try again for a new prompt.");
        }
      } else {
        await interaction.reply({
          content: "Captcha verification is not enabled.",
          ephemeral: true,
        });
      }
    } catch (error) {
      consola.error(c.red(`Error handling captcha verification:`, error));
      await interaction.reply({
        content: "An error occurred while verifying captcha.",
        ephemeral: true,
      });
    }
  },
};
