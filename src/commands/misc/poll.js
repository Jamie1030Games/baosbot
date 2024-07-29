const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { EmbedBuilder } = require("discord.js");
const Guild = require("../../schemas/guild");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll with multiple options")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The question for the poll")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("option1").setDescription("First option").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("option2")
        .setDescription("Second option")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("option3").setDescription("Third option")
    )
    .addStringOption((option) =>
      option.setName("option4").setDescription("Fourth option")
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
      }
    } catch (error) {
      consola.error(c.red(`Error adding guild to the database:`, error));
    }
    const question = interaction.options.getString("question");
    const options = [
      interaction.options.getString("option1"),
      interaction.options.getString("option2"),
      interaction.options.getString("option3"),
      interaction.options.getString("option4"),
    ].filter((option) => option);

    if (options.length < 2) {
      return interaction.reply({
        content: "You need at least 2 options to create a poll.",
        ephemeral: true,
      });
    }

    const pollEmbed = new EmbedBuilder()
      .setColor(existingGuild.config.embedColor)
      .setTitle(question)
      .setDescription(
        options.map((option, index) => `${index + 1}. ${option}`).join("\n")
      )
      .setFooter({ text: "React with the corresponding number to vote!" });

    const pollMessage = await interaction.reply({
      embeds: [pollEmbed],
      fetchReply: true,
    });

    // Add reactions for voting
    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(`${i + 1}️⃣`);
    }
  },
};
