const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const User = require('../../schemas/user'); // Adjust the path as necessary
const canvafy = require('canvafy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboards')
    .setDescription('Show different leaderboards')
    .addSubcommand(subcommand =>
      subcommand
        .setName('coins')
        .setDescription('Show the leaderboard of top coin holders'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('level')
        .setDescription('Show the leaderboard of top users by level')),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'coins') {
      // Handle the 'coins' leaderboard logic
      const users = await User.find().sort({ coins: -1 }).limit(10); // Top 10 users

      if (users.length === 0) {
        return interaction.reply('No users found.');
      }

      const userData = await Promise.all(users.map(async (user, index) => {
        const member = await interaction.guild.members.fetch(user.userId);
        return {
          top: index + 1,
          avatar: member.user.displayAvatarURL({ format: 'png' }),
          tag: member.user.tag,
          score: user.coins,
        };
      }));

      const top = await new canvafy.Top()
        .setOpacity(0.6)
        .setScoreMessage("Coins:")
        .setabbreviateNumber(false)
        .setBackground("image", "https://www.designyourway.net/blog/wp-content/uploads/2018/11/pastel-background-goo-1536x864.jpg")
        .setColors({ box: '#212121', username: '#ffffff', score: '#ffffff', firstRank: '#f7c716', secondRank: '#9e9e9e', thirdRank: '#94610f' })
        .setUsersData(userData)
        .build();

      await interaction.reply({
        files: [{ attachment: top, name: `top-${interaction.user.id}.png` }]
      });
    } else if (subcommand === 'level') {
      // Handle the 'level' leaderboard logic
      const users = await User.find().sort({ level: -1 }).limit(10); // Top 10 users

      if (users.length === 0) {
        return interaction.reply('No users found.');
      }
      const userData = await Promise.all(users.map(async (user, index) => {
        const member = await interaction.guild.members.fetch(user.userId);
        return {
          top: index + 1,
          avatar: member.user.displayAvatarURL({ format: 'png' }),
          tag: member.user.tag,
          score: user.level,
        };
      }));

      const top = await new canvafy.Top()
        .setOpacity(0.6)
        .setScoreMessage("Level:")
        .setabbreviateNumber(false)
        .setBackground("image", "https://www.designyourway.net/blog/wp-content/uploads/2018/11/pastel-background-goo-1536x864.jpg")
        .setColors({ box: '#212121', username: '#ffffff', score: '#ffffff', firstRank: '#f7c716', secondRank: '#9e9e9e', thirdRank: '#94610f' })
        .setUsersData(userData)
        .build();

      await interaction.reply({
        files: [{ attachment: top, name: `top-${interaction.user.id}.png` }]
      });
    }
  },
};
