const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
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
      }
    } catch (error) {
      consola.error(c.red(`Error adding guild to the database:`, error));
    }
    const user = await User.findOne({ userId: interaction.user.id });

    if (!user || user.items.length === 0) {
      return interaction.reply("You do not have any items.");
    }

    // Combine duplicate items and keep the one with the highest expirationDate
    const itemMap = new Map();

    user.items.forEach((item) => {
      const key = `${item.name}-${item.description}-${item.type}`;
      const currentItem = itemMap.get(key);

      if (!currentItem || (item.expirationDate && item.expirationDate > currentItem.expirationDate)) {
        itemMap.set(key, { ...item._doc, count: (currentItem ? currentItem.count + 1 : 1) });
      }
    });

    const combinedItems = Array.from(itemMap.values());

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

      currentItems.forEach((item) => {
        const expirationDate = item.expirationDate
          ? timeUntil(item.expirationDate)
          : "Never";
        embed.addFields({
          name: `Item: ${item.name} (x${item.count})`,
          value: `Effect: ${item.description}\nExpires: ${expirationDate}`,
          inline: false,
        });
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
