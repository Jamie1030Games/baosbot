const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js"); // Import ActionRowBuilder
const Item = require("../../schemas/item");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("Add a new item to the shop.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the item")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Description of the item")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("expiration")
        .setDescription("Expiration duration in milliseconds")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("price")
        .setDescription("Price of the item in coins")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription(
          "Type of the item (e.g., coin_multiplier, luck_booster)"
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    const name = interaction.options.getString("name");
    const description = interaction.options.getString("description");
    const expirationDuration = interaction.options.getInteger("expiration");
    const price = interaction.options.getInteger("price");
    const type = interaction.options.getString("type");

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Add Item Details")
      .setDescription(`You are adding a **${name}** to the shop.`)
      .addFields(
        { name: "Description", value: description },
        { name: "Expiration Duration", value: `${expirationDuration} ms` },
        { name: "Price", value: `${price} coins` },
        { name: "Type", value: type }
      )
      .setFooter({ text: "Please provide additional details." });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [row] });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "confirm") {
        let multiplier = 1;
        let luckBoost = 0;

        if (type === "coin_multiplier") {
          await i.channel.send("Please enter the multiplier value:");
          const multiplierFilter = (response) =>
            response.author.id === interaction.user.id;
          const multiplierResponse = await interaction.channel.awaitMessages({
            filter: multiplierFilter,
            max: 1,
            time: 60000,
            errors: ["time"],
          });
          multiplier = parseFloat(multiplierResponse.first().content);
        } else if (type === "luck_booster") {
          await i.channel.send("Please enter the luck boost percentage:");
          const luckFilter = (response) =>
            response.author.id === interaction.user.id;
          const luckResponse = await interaction.channel.awaitMessages({
            filter: luckFilter,
            max: 1,
            time: 60000,
            errors: ["time"],
          });
          luckBoost = parseFloat(luckResponse.first().content);
        }

        const newItem = new Item({
          name,
          description,
          expirationDuration,
          price,
          type,
          multiplier,
          luckBoost,
        });

        await newItem.save();
        await i.channel.send(
          `Item **${name}** has been added to the shop with the following details:\nMultiplier: ${multiplier}\nLuck Boost: ${luckBoost}%`
        );
      } else if (i.customId === "cancel") {
        await i.channel.send("Item creation canceled.");
      }

      collector.stop();
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.editReply(
          "You did not respond in time. Item creation canceled."
        );
      }
    });
  },
};
