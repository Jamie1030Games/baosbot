/* eslint-disable no-undef */
// jobs/fish.js
const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const User = require("../../schemas/user");
const Guild = require("../../schemas/guild");
const mongoose = require("mongoose");
const handleCoins = require("../../middleware/coinAdder");
const { deleteMessageAfterTimeout } = require('../../middleware/deleteMessage'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fish")
    .setDescription("Go fishing and catch a fish worth random coins!"),

  async execute(interaction) {
    const userId = interaction.user.id;
    let user = await User.findOne({ userId });

    try {
      if (!user) {
        user = new User({
          _id: new mongoose.Types.ObjectId(),
          userId,
          coins: 0,
          level: 1,
          xp: 0,
          lastMessageTimestamp: now,
        });
        await user.save();
      }
    } catch (error) {
      console.error(`Error adding guild to the database:`, error);
    }

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
    const imagesDir = path.join(__dirname, "..", "images");
    const standingImage = fs.readFileSync(path.join(imagesDir, "standing.png"));
    const isFishingImage = fs.readFileSync(
      path.join(imagesDir, "isFishing.png")
    );
    const caughtImage = fs.readFileSync(path.join(imagesDir, "caught.png"));

    const embed = new EmbedBuilder()
      .setTitle("Fishing")
      .setDescription("Press the button to start fishing!")
      .setColor(existingGuild.config.embedColor)
      .setImage("attachment://standing.png");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("startFishing")
        .setLabel("Start Fishing")
        .setStyle(ButtonStyle.Primary)
    );

    let fishMessage = await interaction.reply({
      embeds: [embed],
      components: [row],
      files: [{ attachment: standingImage, name: "standing.png" }],
      fetchReply: true,
    });

    const filter = (i) =>
      i.customId === "startFishing" && i.user.id === interaction.user.id;
    const collector = fishMessage.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 15000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "startFishing") {
        await i.update({
          embeds: [
            new EmbedBuilder()
              .setTitle("Fishing")
              .setColor(existingGuild.config.embedColor)
              .setDescription(
                "You are now fishing... Wait for a moment to catch a fish!"
              )
              .setImage("attachment://isFishing.png"),
          ],
          components: [],
          files: [{ attachment: isFishingImage, name: "isFishing.png" }],
        });

        setTimeout(async () => {
          const fishNames = ["Goldfish", "Salmon", "Trout", "Shark"];
          const fishValues = [10, 20, 30, 100];
          const randomIndex = Math.floor(Math.random() * fishNames.length);
          const fishName = fishNames[randomIndex];
          const fishValue = fishValues[randomIndex];

          const finalPrice = await handleCoins(interaction.user.id, fishValue);
          const multiplier = (finalPrice / fishValue).toFixed(2);

          let multi = "";
          if (finalPrice > fishValue) {
            multi = ` (${finalPrice} with your active multiplier of ${multiplier})`;
          }

          await i.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Caught a Fish!")
                .setColor(existingGuild.config.embedColor)
                .setDescription(
                  `You caught a ${fishName} worth ${fishValue} coins${multi}!`
                )
                .setImage("attachment://caught.png"),
            ],
            files: [{ attachment: caughtImage, name: "caught.png" }],
          });

          user.coins += finalPrice;
          await user.save();
          deleteMessageAfterTimeout(fishMessage, 5000);
        }, 5000);
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.editReply({
          content: "Fishing attempt expired. Please try again.",
          components: [],
        });
      }
    });
  },
};
