const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const User = require("../../schemas/user"); // Adjust the path as necessary
const Guild = require("../../schemas/guild");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addcoins")
    .setDescription("Add coins to a user")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to add coins to")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of coins to add")
        .setRequired(true)
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
    const target = interaction.options.getUser("target");
    const amount = interaction.options.getInteger("amount");

    if (amount <= 0) {
      return interaction.reply("The amount must be greater than zero.");
    }

    try {
      let user = await User.findOne({ userId: target.id });
      if (!user) {
        user = new User({ userId: target.id, coins: 0 });
      }
      user.coins += amount;
      await user.save();

      const successEmbed = new EmbedBuilder()
        .setColor(existingGuild.config.embedColor)
        .setTitle("Coins Added")
        .setDescription(
          `Successfully added ${amount} coins to ${target.username}.`
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Error adding coins:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription("An error occurred while adding coins.")
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
