const { SlashCommandBuilder } = require('@discordjs/builders');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Set a reminder')
    .addStringOption(option => option.setName('time').setDescription('Time to remind (e.g., 10m, 1h)').setRequired(true))
    .addStringOption(option => option.setName('message').setDescription('Reminder message').setRequired(true)),

  async execute(interaction) {
    const time = interaction.options.getString('time');
    const message = interaction.options.getString('message');

    const timeInMs = ms(time); // Use a library like `ms` to convert time to milliseconds
    if (!timeInMs) return interaction.reply('Invalid time format!');

    setTimeout(() => {
      interaction.user.send(`Reminder: ${message}`);
    }, timeInMs);

    await interaction.reply(`Reminder set for ${time}`);
  },
};
