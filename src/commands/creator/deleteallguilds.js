const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const Guild = require("../../schemas/guild");
const { PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deleteallguilds")
    .setDescription("Deletes all guilds from the database. Use with caution.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  async execute(interaction) {
    // Check if the user has the required permission (optional)
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
    }

    try {
      // Delete all guild documents from the database
      await Guild.deleteMany({});
      await interaction.reply("All guilds have been deleted from the database.");
    } catch (error) {
      consola.error(c.red('Error deleting all guilds:' + error));
      await interaction.reply("There was an error deleting all guilds from the database.");
    }
  },
};
