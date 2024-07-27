const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll with multiple options')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('The question for the poll')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('option1')
        .setDescription('First option')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('option2')
        .setDescription('Second option')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('option3')
        .setDescription('Third option')
    )
    .addStringOption(option =>
      option
        .setName('option4')
        .setDescription('Fourth option')
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
    ].filter(option => option);

    if (options.length < 2) {
      return interaction.reply({ content: 'You need at least 2 options to create a poll.', ephemeral: true });
    }

    const pollEmbed = {
      color: 0xFFFF00,
      title: question,
      description: options.map((option, index) => `${index + 1}. ${option}`).join('\n'),
      footer: {
        text: 'React with the corresponding number to vote!',
      },
    };

    const pollMessage = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });

    // Add reactions for voting
    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(`${i + 1}️⃣`);
    }
  },
};
