const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to get information about')
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const userInfoEmbed = {
      color: 0x00FF00,
      title: `Information about ${user.tag}`,
      thumbnail: {
        url: user.displayAvatarURL(),
      },
      fields: [
        {
          name: 'Username',
          value: user.username,
          inline: true,
        },
        {
          name: 'Joined Server At',
          value: member ? member.joinedAt.toDateString() : 'N/A',
          inline: true,
        },
        {
          name: 'Account Created At',
          value: user.createdAt.toDateString(),
          inline: true,
        },
      ],
      footer: {
        text: `ID: ${user.id}`,
      },
    };

    return interaction.reply({ embeds: [userInfoEmbed] });
  },
};
