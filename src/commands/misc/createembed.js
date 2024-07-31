const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("createembed")
    .setDescription("Create a custom embed")
    .addStringOption(option => 
      option.setName("color")
        .setDescription("Hex code for the embed color")
        .setRequired(true))
    .addStringOption(option => 
      option.setName("title")
        .setDescription("Title of the embed")
        .setRequired(true))
    .addStringOption(option => 
      option.setName("description")
        .setDescription("Description of the embed")
        .setRequired(true))
    .addStringOption(option => 
      option.setName("footer")
        .setDescription("Footer of the embed")
        .setRequired(false))
    .addStringOption(option => 
      option.setName("thumbnail")
        .setDescription("URL of the thumbnail image")
        .setRequired(false))
    .addStringOption(option => 
      option.setName("image")
        .setDescription("URL of the image")
        .setRequired(false)),
  async execute(interaction) {
    const color = interaction.options.getString("color");
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const footer = interaction.options.getString("footer");
    const thumbnail = interaction.options.getString("thumbnail");
    const image = interaction.options.getString("image");

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(description);

    if (footer) embed.setFooter({ text: footer });
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (image) embed.setImage(image);

    await interaction.reply({ embeds: [embed] });
  },
};
