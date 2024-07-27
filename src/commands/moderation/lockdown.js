const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Locks down a channel for a specified duration.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to lock down')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('duration')
        .setDescription('The duration of the lockdown (e.g., 10m, 1h, 2d)')
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const duration = interaction.options.getString('duration');

    const time = ms(duration);
    if (!time) {
      return interaction.reply({ content: 'Invalid duration format. Use something like 10m, 1h, or 2d.', ephemeral: true });
    }

    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: false });

    interaction.reply({ content: `🔒 ${channel} has been locked down for ${duration}.`, ephemeral: true });

    setTimeout(async () => {
      // Remove the specific SendMessages permission overwrite to revert to default permissions
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: null });

      // Send the unlocked message and then delete it after 7.5 seconds
      const liftedMessage = await channel.send('🔓 The lockdown has been lifted.');
      setTimeout(() => {
        liftedMessage.delete().catch(console.error);
      }, 7500);
    }, time);
  },
};
