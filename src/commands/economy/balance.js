const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const User = require("../../schemas/user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your coin balance or someone else's coin balance")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to check the balance of")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user") || interaction.user;
      let userData = await User.findOne({ userId: user.id });

      if (!userData) {
        userData = new User({ userId: user.id, coins: 0 });
        await userData.save();
      }

      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Coins`)
        .setDescription(`${user.username} has ${userData.coins} coins.`)
        .setColor("#FFD700");

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      return console.error(error);
    }
  },
};
