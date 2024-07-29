const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../schemas/user'); // Adjust the path as necessary

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetxp')
    .setDescription('Reset a user\'s levels and XP')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to reset')
        .setRequired(true)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');

    try {
      const userRecord = await User.findOne({ userId: targetUser.id });

      if (!userRecord) {
        return interaction.reply({ content: 'User not found in the database.', ephemeral: true });
      }

      userRecord.level = 0;
      userRecord.xp = 0;
      await userRecord.save();

      return interaction.reply({ content: `${targetUser.username}'s levels and XP have been reset.`, ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'An error occurred while resetting the user\'s levels and XP.', ephemeral: true });
    }
  },
};
