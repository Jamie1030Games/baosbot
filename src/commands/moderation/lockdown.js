const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require('discord.js');
const ms = require('ms');

const lockdowns = new Map(); // To store the lockdown states of channels

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Manages channel lockdowns.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .addSubcommand(subcommand =>
      subcommand
        .setName('lock')
        .setDescription('Locks down a channel for a specified duration.')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel to lock down')
            .setRequired(true))
        .addStringOption(option =>
          option
            .setName('duration')
            .setDescription('The duration of the lockdown (e.g., 10m, 1h, 2d)')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('unlock')
        .setDescription('Unlocks a locked down channel.')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel to unlock')
            .setRequired(true))),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');

    if (subcommand === 'lock') {
      const duration = interaction.options.getString('duration');

      if (ms(duration) <= 0) {
        return interaction.reply({ content: 'Please enter a non-negative and non-zero value.', ephemeral: true });
      }

      const time = ms(duration);
      if (!time) {
        return interaction.reply({ content: 'Invalid duration format. Use something like 10m, 1h, or 2d.', ephemeral: true });
      }

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: false });

      interaction.reply({ content: `🔒 ${channel} has been locked down for ${duration}.`, ephemeral: true });

      lockdowns.set(channel.id, true);

      setTimeout(async () => {
        // Remove the specific SendMessages permission overwrite to revert to default permissions
        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: null });

        // Send the unlocked message and then delete it after 7.5 seconds
        const liftedMessage = await channel.send('🔓 The lockdown has been lifted.');
        setTimeout(() => {
          liftedMessage.delete().catch(console.error);
        }, 7500);

        lockdowns.delete(channel.id);
      }, time);
    } else if (subcommand === 'unlock') {
      if (!lockdowns.has(channel.id)) {
        return interaction.reply({ content: `${channel} is not currently in lockdown.`, ephemeral: true });
      }

      // Remove the specific SendMessages permission overwrite to revert to default permissions
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: null });

      interaction.reply({ content: `🔓 ${channel} has been unlocked.`, ephemeral: true });

      lockdowns.delete(channel.id);
    }
  },
};
