const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { EmbedBuilder } = require("discord.js");
const User = require("../../schemas/user");
const Guild = require("../../schemas/guild");

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
    let existingGuild = await Guild.findOne({ guildId: interaction.guild.id });
    try {
      if (!existingGuild) {
        const newGuild = new Guild({
          guildId: interaction.guild.id,
          config: {
            embedColor: "#FFFFFF", // Default color
          },
        });

        await newGuild.save();
        console.log(`Guild ${interaction.guild.id} added to the database.`);
      }
    } catch (error) {
      console.error(`Error adding guild to the database:`, error);
    }
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
        .setColor(existingGuild.config.embedColor);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      return console.error(error);
    }
  },
};
