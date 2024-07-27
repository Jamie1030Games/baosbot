const { SlashCommandBuilder } = require("@discordjs/builders");
const canvafy = require("canvafy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Ship two users and check how compatible they are.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The first user to ship")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("target2")
        .setDescription("The second user to ship")
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const target2 = interaction.options.getUser("target2");
    const targetPfp = target.displayAvatarURL({
      forceStatic: true,
      extension: "png",
    });
    const targetPfp2 = target2.displayAvatarURL({
      forceStatic: true,
      extension: "png",
    });

    const ship = await new canvafy.Ship()
      .setAvatars(targetPfp, targetPfp2)
      .setBackground(
        "image",
        "https://www.designyourway.net/blog/wp-content/uploads/2018/11/pastel-background-goo-1536x864.jpg"
      )
      .setBorder("#f0f0f0")
      .setOverlayOpacity(0.5)
      .build();

    interaction.reply({
      content: `${interaction.user.username} shipped ${target.username} and ${target2.username}`,
      files: [
        {
          attachment: ship,
          name: `ship-${interaction.user.id}.png`,
        },
      ],
    });
  },
};