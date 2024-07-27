// middleware/muteMiddleware.js

const { PermissionsBitField } = require("discord.js");
const Guild = require("../schemas/guild");

module.exports = async function muteMiddleware(
  interaction,
  user,
  reason,
  isNew
) {
  // Check if the user has the right permissions
  if (
    !interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)
  ) {
    return interaction.reply({
      content: "You do not have permission to use this command.",
      ephemeral: true,
    });
  }

  try {
    let existingGuild = await Guild.findOne({ guildId: interaction.guild.id });

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

    // Get the mute role
    const muteRole = existingGuild.config.muteRole;

    if (
      !muteRole ||
      muteRole === "0" ||
      muteRole === null ||
      muteRole === undefined
    ) {
      await interaction.reply({
        content:
          "Mute role is not set. Please configure it using the appropriate command.",
        ephemeral: true,
      });
      return;
    }

    // Add mute role to the user
    const member = await interaction.guild.members.fetch(user.id);
    await member.roles.add(muteRole, reason);

    if (isNew != true) {
      await interaction.reply({
        content: `Successfully muted ${user.tag}. Reason: ${reason}`,
        ephemeral: true,
      });
    } else {
      await interaction.editReply({
        content: `Successfully muted ${user.tag}. Reason: ${reason}`,
        ephemeral: true,
        embeds: [],
      });
    }
  } catch (error) {
    console.error("Error muting user:", error);
    if (isNew != true) {
        await interaction.reply({
            content: "There was an error while trying to mute the user.",
            ephemeral: true,
          });
      } else {
        await interaction.editReply({
            content: "There was an error while trying to mute the user.",
            ephemeral: true,
          });
      }
  }
};
