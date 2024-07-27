const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays a help menu with command categories"),

  async execute(interaction) {
    const userId = interaction.user.id;

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("help_select") // Set a consistent customId
      .setPlaceholder("Select a category")
      .addOptions([
        { label: "Fun", value: "fun" },
        { label: "Economy", value: "economy" },
        { label: "Moderator", value: "moderator" },
        { label: "Miscellaneous", value: "other" },
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle("Help Menu")
      .setDescription("Select a category to view available commands.")
      .setColor("#0099ff");

    await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    // Store the userId in a way that can be accessed by the handler
    interaction.client.userId = userId;
  },
};
