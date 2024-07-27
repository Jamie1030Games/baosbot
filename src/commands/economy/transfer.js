const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const User = require("../../schemas/user");

const TAX_RATE = 0.05; // 5% tax

module.exports = {
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Initiate a coin transfer with tax confirmation")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to transfer coins to")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of coins to transfer")
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const amount = interaction.options.getInteger("amount");
    const tax = amount * TAX_RATE; // Calculate tax
    const amountAfterTax = amount - tax; // Amount to transfer after tax

    const user = await User.findOne({ userId: interaction.user.id });

    if (!user || user.coins < amount) {
      return interaction.reply({
        content: `You don't have enough coins to transfer.`,
        ephemeral: true,
      });
    }

    // Create confirmation buttons
    const confirmButton = new ButtonBuilder()
      .setCustomId("confirm_transfer")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Success);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel_transfer")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(
      confirmButton,
      cancelButton
    );

    // Create and send the embed message
    const confirmEmbed = new EmbedBuilder()
      .setColor("#FFCC00")
      .setTitle("Transfer Confirmation")
      .setDescription(
        `💰 You are about to transfer ${amountAfterTax} coins to ${
          target.username
        }. A tax of ${tax.toFixed(2)} will be applied. Do you want to proceed?`
      )
      .setTimestamp();

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [row],
      ephemeral: true,
    });

    // Create a collector for the button interactions
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "confirm_transfer") {
        // Deduct tax from sender's balance
        user.coins -= amount;

        // If target does not have an entry, create one
        let targetUser = await User.findOne({ userId: target.id });
        if (!targetUser) {
          targetUser = new User({ userId: target.id, coins: amountAfterTax });
        } else {
          targetUser.coins += amountAfterTax;
        }
        await targetUser.save();
        await user.save();

        const dmEmbed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("You Received Coins!")
          .setDescription(
            `You have received ${amountAfterTax} coins from ${interaction.user.username}.`
          )
          .setTimestamp();

        try {
          await target.send({ embeds: [dmEmbed] });
        } catch (error) {
          console.error(
            `Could not send DM to ${target.username}: ${error.message}`
          );
        }

        const successEmbed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("Transfer Successful")
          .setDescription(
            `💰 ${
              interaction.user.username
            } successfully transferred ${amountAfterTax} coins to ${
              target.username
            } (Tax: ${tax.toFixed(2)})`
          )
          .setTimestamp();

        await i.update({ embeds: [successEmbed], components: [] });
      } else if (i.customId === "cancel_transfer") {
        const cancelEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Transfer Cancelled")
          .setDescription("The coin transfer has been cancelled.")
          .setTimestamp();

        await i.update({ embeds: [cancelEmbed], components: [] });
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Timeout")
          .setDescription("The coin transfer request timed out.")
          .setTimestamp();

        interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};
