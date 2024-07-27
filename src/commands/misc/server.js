const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about the server'),

  async execute(interaction) {
    const serverEmbed = {
      color: 0x00FF00,
      title: `Information about ${interaction.guild.name}`,
      thumbnail: {
        url: interaction.guild.iconURL(),
      },
      fields: [
        {
          name: 'Server Name',
          value: interaction.guild.name,
          inline: true,
        },
        {
          name: 'Total Members',
          value: `${interaction.guild.memberCount}`,
          inline: true,
        },
        {
          name: 'Created At',
          value: `${interaction.guild.createdAt.toDateString()}`,
          inline: true,
        },
      ],
      footer: {
        text: `ID: ${interaction.guild.id}`,
      },
    };

    return interaction.reply({ embeds: [serverEmbed] });
  },
};
