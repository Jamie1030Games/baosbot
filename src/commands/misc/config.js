const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const Guild = require("../../schemas/guild");
const getHexCode = require("../../functions/converters/colorConverter");

const settings = [
  "setColor",
  "welcomeEnabled",
  "verifyEnabled",
  "muteRole",
  "levelEnabled",
];
let currentIndex = 0;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure your server with features you desire.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  async execute(interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }
    const guildId = interaction.guildId;
    const embed = createEmbed(settings[currentIndex]);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("back")
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("set")
        .setLabel("Set")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("forward")
        .setLabel("Forward")
        .setStyle(ButtonStyle.Secondary)
    );

    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "back") {
        currentIndex = (currentIndex - 1 + settings.length) % settings.length;
        try {
          await i.update({
            embeds: [createEmbed(settings[currentIndex])],
            components: [row],
          });
        } catch (error) {
          consola.error(c.red(error));
        }
      } else if (i.customId === "set") {
        await handleSetting(interaction, settings[currentIndex], guildId);
        collector.stop();
      } else if (i.customId === "forward") {
        currentIndex = (currentIndex + 1) % settings.length;
        await i.update({
          embeds: [createEmbed(settings[currentIndex])],
          components: [row],
        });
      }
    });

    collector.on("end", () => {
      try {
        message.edit({ components: [] });
      } catch (error) {
        consola.error(c.red(error));
      }
    });
  },
};

function createEmbed(setting) {
  return new EmbedBuilder()
    .setTitle(`Configure: ${setting}`)
    .setDescription(`Use the buttons below to navigate and set the ${setting}.`)
    .setColor('#FFFFFF');
}

async function handleSetting(interaction, setting, guildId) {
  let guildConfig = await Guild.findOne({ guildId });
  if (!guildConfig) {
    guildConfig = new Guild({ guildId });
  }

  if (setting === "setColor") {
    await interaction.followUp("Please provide the color:");
    const colorFilter = (response) =>
      response.author.id === interaction.user.id;
    const collected = await interaction.channel
      .awaitMessages({
        filter: colorFilter,
        max: 1,
        time: 30000,
        errors: ["time"],
      })
      .catch(() => null);

    if (!collected || !collected.first()) {
      await interaction.followUp("No color provided. Setting canceled.");
      return;
    }

    const color = collected.first().content;
    const hexColor = getHexCode(color);
    if (!hexColor) {
      await interaction.followUp("Invalid color format. Setting canceled.");
      return;
    }

    guildConfig.config.embedColor = hexColor;
    await guildConfig.save();
    await interaction.followUp(`Color set to ${hexColor}`);
  } else if (setting === "welcomeEnabled") {
    if (guildConfig.config.welcomeEnabled == "true") {
      guildConfig.config.welcomeEnabled = "false";
      guildConfig.config.welcomeChannel = "0"; // Reset to default or empty
      await guildConfig.save();
      await interaction.followUp(`Welcoming has been disabled.`);
    } else {
      guildConfig.config.welcomeEnabled = "true";
      await guildConfig.save();
      await interaction.followUp(
        "Please provide the channel for welcome messages:"
      );
      const channelFilter = (response) =>
        response.author.id === interaction.user.id;
      const collected = await interaction.channel
        .awaitMessages({
          filter: channelFilter,
          max: 1,
          time: 30000,
          errors: ["time"],
        })
        .catch(() => null);

      if (!collected || !collected.first()) {
        await interaction.followUp("No channel provided. Setting canceled.");
        return;
      }

      const channel = collected.first().mentions.channels.first();
      if (!channel) {
        await interaction.followUp("No channel mentioned. Setting canceled.");
        return;
      }

      guildConfig.config.welcomeChannel = channel.id;
      await guildConfig.save();
      await interaction.followUp(`Welcome messages enabled in ${channel}`);
    }
  } else if (setting === "verifyEnabled") {
    if (guildConfig.config.verifyEnabled == "true") {
      guildConfig.config.verifyEnabled = "false";
      guildConfig.config.verifyChannel = "0"; // Reset to default or empty
      guildConfig.config.verifiedRole = "0"; // Reset verified role
      await guildConfig.save();
      await interaction.followUp(`Verification has been disabled.`);
    } else {
      guildConfig.config.verifyEnabled = "true";
      await guildConfig.save();
      await interaction.followUp(
        "Please provide the channel for verification messages:"
      );
      const channelFilter = (response) =>
        response.author.id === interaction.user.id;
      const collected = await interaction.channel
        .awaitMessages({
          filter: channelFilter,
          max: 1,
          time: 30000,
          errors: ["time"],
        })
        .catch(() => null);

      if (!collected || !collected.first()) {
        await interaction.followUp("No channel provided. Setting canceled.");
        return;
      }

      const channel = collected.first().mentions.channels.first();
      if (!channel) {
        await interaction.followUp("No channel mentioned. Setting canceled.");
        return;
      }

      guildConfig.config.verifyChannel = channel.id;
      await guildConfig.save();
      await interaction.followUp("Please provide the verified role:");

      const roleFilter = (response) =>
        response.author.id === interaction.user.id;
      const roleCollected = await interaction.channel
        .awaitMessages({
          filter: roleFilter,
          max: 1,
          time: 30000,
          errors: ["time"],
        })
        .catch(() => null);

      if (!roleCollected || !roleCollected.first()) {
        await interaction.followUp("No role provided. Setting canceled.");
        return;
      }

      const role = roleCollected.first().mentions.roles.first();
      if (!role) {
        await interaction.followUp("No role mentioned. Setting canceled.");
        return;
      }

      guildConfig.config.verifyChannel = channel.id;
      guildConfig.config.verifyRole = role.id;
      await guildConfig.save();
      await channel.send(
        `Verification messages have been enabled and setup in this channel.`
      );
      await interaction.followUp(`Verified role has been set to ${role}.`);
    }
  } else if (setting === "muteRole") {
    if (guildConfig.config.muteRole) {
      guildConfig.config.muteRole = "0";
      await guildConfig.save();
      await interaction.followUp(
        "Mute role has been reset. Please use the mute command again to set it."
      );
    } else {
      await interaction.followUp("No mute role is set to reset.");
    }
  } else if (setting === "levelEnabled") {
    if (guildConfig.config.levelEnabled == "true") {
      guildConfig.config.levelEnabled = "false";
      guildConfig.config.levelChannel = "0"; // Reset to default or empty
      await guildConfig.save();
      await interaction.followUp(`Leveling system has been disabled.`);
    } else {
      guildConfig.config.levelEnabled = "true";
      await guildConfig.save();
      await interaction.followUp(
        "Please provide the channel for leveling notifications:"
      );
      const channelFilter = (response) =>
        response.author.id === interaction.user.id;
      const collected = await interaction.channel
        .awaitMessages({
          filter: channelFilter,
          max: 1,
          time: 30000,
          errors: ["time"],
        })
        .catch(() => null);

      if (!collected || !collected.first()) {
        await interaction.followUp("No channel provided. Setting canceled.");
        return;
      }

      const channel = collected.first().mentions.channels.first();
      if (!channel) {
        await interaction.followUp("No channel mentioned. Setting canceled.");
        return;
      }

      guildConfig.config.levelChannel = channel.id;
      await guildConfig.save();
      await interaction.followUp(`Level notifications enabled in ${channel}`);
    }
  }
}
