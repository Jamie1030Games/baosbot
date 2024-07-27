const { EmbedBuilder } = require("discord.js");
const Guild = require("../schemas/guild"); // Adjust the path if necessary
const muteMiddleware = require("./muteMiddleware");

module.exports = async function setMuteRoleMiddleware(interaction, user, reason) {
  // Ensure this is a command interaction
  if (!interaction.isCommand()) return;

  // Send a message asking for the mute role
  const embed = new EmbedBuilder()
    .setTitle("Mute Role Setup")
    .setDescription(
      "Please mention the role you want to use for muting members."
    );

  await interaction.reply({ embeds: [embed] });

  // Set up a filter to collect responses from the same user
  const filter = (response) => response.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({
    filter,
    max: 1,
    time: 30000,
  });

  collector.on("collect", async (message) => {
    // Extract the role from the message
    const roleMention = message.content.match(/<@&(\d+)>/);
    const roleId = roleMention ? roleMention[1] : null;
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) {
      await interaction.followUp(
        "Invalid role mention. Please mention a valid role."
      );
      return;
    }

    // Store the role ID in the database
    let guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig) {
      guildConfig = new Guild({
        guildId: interaction.guild.id,
        config: {
          embedColor: "#FFFFFF", // Default color
        },
      });
    }

    guildConfig.config.muteRole = role.id;
    await guildConfig.save();
    let isNew = true;
    await interaction.followUp(`Mute role has been set to ${role.name}. To change it, go to /config.`);
    await muteMiddleware(interaction, user, reason, isNew);
});

  collector.on("end", (collected, reason) => {
    if (reason === "time") {
      interaction.followUp(
        "No role mention received in time. Please try again."
      );
    }
  });
};
