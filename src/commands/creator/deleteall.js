const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const User = require('../../schemas/user'); // Adjust the path as necessary

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleteall')
    .setDescription('Delete all user accounts (requires confirmation)')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interaction) {
    // Create confirmation buttons
    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm_delete_all')
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Success);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel_delete_all')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

    // Create and send the embed message
    const confirmEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Confirm Deletion')
      .setDescription('⚠️ You are about to delete all user accounts. This action is irreversible. Do you want to proceed?')
      .setTimestamp();

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    // Create a collector for the button interactions
    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
      if (i.customId === 'confirm_delete_all') {
        try {
          // Delete all user accounts
          await User.deleteMany({});

          const successEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Deletion Successful')
            .setDescription('All user accounts have been successfully deleted.')
            .setTimestamp();

          await i.update({ embeds: [successEmbed], components: [] });
        } catch (error) {
          console.error('Error deleting all user accounts:', error);

          const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Error')
            .setDescription('An error occurred while deleting all user accounts.')
            .setTimestamp();

          await i.update({ embeds: [errorEmbed], components: [] });
        }
      } else if (i.customId === 'cancel_delete_all') {
        const cancelEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Cancelled')
          .setDescription('The deletion of user accounts has been cancelled.')
          .setTimestamp();

        await i.update({ embeds: [cancelEmbed], components: [] });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Timeout')
          .setDescription('The deletion request timed out.')
          .setTimestamp();

        interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};
