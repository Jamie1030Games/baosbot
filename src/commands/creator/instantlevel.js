const { SlashCommandBuilder } = require("@discordjs/builders");
const User = require("../../schemas/user"); // Adjust the path as necessary

module.exports = {
  data: new SlashCommandBuilder()
    .setName("instantlevel")
    .setDescription("Instantly level up a user by one level")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to level up")
        .setRequired(true)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("target");
    const userData = await User.findOne({ userId: targetUser.id });
    if (!userData) {
      await User.create({ userId: targetUser.id, level: 2 });
    } else {
      userData.xp =+ 460;
      await userData.save();
      return interaction.reply({
        content: 'Successfully leveled up.',
        ephemeral: true,
      })
    }
  },
};
