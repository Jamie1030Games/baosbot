const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { PermissionsBitField } = require("discord.js");
const setMuteRoleMiddleware = require("../../middleware/muteRole");
const Guild = require("../../schemas/guild");
const muteMiddleware = require("../../middleware/muteMiddleware");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a user in the server")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
    .addUserOption((option) =>
      option.setName("user").setDescription("User to mute").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for the mute")
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

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

    // Check if the user has the right permissions
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    // Get the mute role
    const muteRole = existingGuild.config.muteRole;

    if (
      !muteRole ||
      muteRole == "0" ||
      muteRole == null ||
      muteRole == undefined
    ) {
      await setMuteRoleMiddleware(interaction, user, reason);
    } else {
      await muteMiddleware(interaction, user, reason);
    }
  },
};
