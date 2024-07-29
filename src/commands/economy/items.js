const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const User = require("../../schemas/user");
const timeUntil = require("../../functions/converters/timeUntil");
const Guild = require('../../schemas/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("items")
    .setDescription("View all your current items and their effects."),
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
    const user = await User.findOne({ userId: interaction.user.id });

    if (!user || user.items.length === 0) {
      return interaction.reply("You do not have any items.");
    }

    // Combine duplicate items
    const itemCounts = user.items.reduce((acc, item) => {
      const key = `${item.name}-${item.description}-${item.type}`;
      if (!acc[key]) {
        acc[key] = { ...item._doc, count: 0 }; // _doc to access the original document
      }
      acc[key].count += 1;
      return acc;
    }, {});

    const combinedItems = Object.values(itemCounts);

    // Pagination setup
    let page = 0;
    const itemsPerPage = 10;
    const totalPages = Math.ceil(combinedItems.length / itemsPerPage);

    const generateEmbed = (page) => {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;
      const currentItems = combinedItems.slice(start, end);

      const embed = new EmbedBuilder()
        .setColor(existingGuild.config.embedColor)
        .setTitle("Your Items")
        .setDescription("Here are the items you currently have:")
        .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

      user.items.forEach((item) => {
        console.log(timeUntil(item.expirationDate));
      });

      currentItems.forEach((item) => {
        const expirationDate = item.expirationDate
          ? timeUntil(item.expirationDate)
          : "Never";
        embed.addFields({
          name: `Item: ${item.name} (x${item.count})`,
          value: `Effect: ${item.description}\nExpires: ${expirationDate}`,
          inline: false,
        });
        console.log(item.notaxAmt);
      });


      return embed;
    };

    const generateComponents = (page) => {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages - 1)
      );

      return [row];
    };

    const embedMessage = await interaction.reply({
      embeds: [generateEmbed(page)],
      components: generateComponents(page),
      fetchReply: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = embedMessage.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "prev") {
        page = Math.max(page - 1, 0);
      } else if (i.customId === "next") {
        page = Math.min(page + 1, totalPages - 1);
      }

      await i.update({
        embeds: [generateEmbed(page)],
        components: generateComponents(page),
      });
    });

    collector.on("end", () => {
      embedMessage.edit({
        components: [],
      });
    });
  },
};
