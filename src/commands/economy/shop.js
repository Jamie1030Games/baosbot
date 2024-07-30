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
const Item = require("../../schemas/item");
const User = require("../../schemas/user");
const convertMilliseconds = require("../../functions/converters/convertMilliseconds.js");
const Guild = require("../../schemas/guild.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Browse and buy items from the shop"),
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
    let embedUnique;
    let itemExp;
    try {
      // Fetch items and filter out items that are off sale
      const items = await Item.find({ isOffSale: { $ne: "true" } });

      if (items.length === 0) {
        return interaction.reply("No items available in the shop.");
      }

      let page = 0;
      const itemsPerPage = 1; // Only one item per page
      const totalPages = Math.ceil(items.length / itemsPerPage);

      const generateEmbed = (page) => {
        const item = items[page];
        try {
          itemExp = convertMilliseconds(item.expirationDuration);
        } catch (error) {
          consola.error(c.red(error.message));
        }

        if (item.isUnique == 'true') {
          embedUnique = 'Yes (only 1)';
        } else if (item.isUnique == 'false') {
          embedUnique = 'No (stacks)';
        }

        let itemNumber;
        if (item.type == 'coin_multiplier') {
          itemNumber = item.multiplier + 'x';
        } else if (item.type == 'luck_booster') {
          itemNumber = item.luckBoost + '%';
        } else if (item.type == 'no_tax') {
          itemNumber = item.notaxAmt + 'x';
        } else {
          itemNumber = 'none';
        }

        const embed = new EmbedBuilder()
          .setColor(existingGuild.config.embedColor)
          .setTitle(item.name)
          .setDescription(item.description || "No description available")
          .addFields(
            {
              name: "Effect",
              value: item.type + ` (${itemNumber})` || "No effect",
            },
            {
              name: "Price",
              value: `${item.price} coins`,
            },
            {
              name: "Unique Item",
              value: `${embedUnique}`,
            },
            {
              name: "Expiration",
              value: itemExp ? itemExp : "Never",
            }
          )
          .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

        return embed;
      };

      const generateComponents = (page) => {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("first")
            .setLabel("First")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId(`buy_${page}`)
            .setLabel("Buy")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages - 1),
          new ButtonBuilder()
            .setCustomId("last")
            .setLabel("Last")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages - 1)
        );

        return [row];
      };

      // Initial reply to the interaction
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
        try {
          if (i.customId === "prev") {
            page = Math.max(page - 1, 0);
          } else if (i.customId === "next") {
            page = Math.min(page + 1, totalPages - 1);
          } else if (i.customId === "first") {
            page = 0;
          } else if (i.customId === "last") {
            page = totalPages - 1;
          } else if (i.customId.startsWith("buy_")) {
            const itemIndex = parseInt(i.customId.split("_")[1]);
            const item = items[itemIndex];
            const user = await User.findOne({ userId: interaction.user.id });

            if (!user || user.coins < item.price) {
              return i.reply({
                content: "You do not have enough coins to buy this item.",
                ephemeral: true,
              });
            }

            const petTurtleCount = user.items.filter(
              (item) => item.name === "Pet Turtle"
            ).length;

            // Check if the user already has a unique item
            const hasUnique = user.items.some(
              (existingItem) =>
                existingItem.isUnique === "true" &&
                existingItem.name === item.name
            );

            if (petTurtleCount >= 3 && item.name === "Pet Turtle") {
              return i.reply({
                content: "You cannot buy more than 3 Pet Turtles.",
                ephemeral: true,
              });
            }

            if (item.isUnique === "true" && hasUnique) {
              return i.reply({
                content:
                  "This item is unique. You may only have one at a time.",
                ephemeral: true,
              });
            }

            user.coins -= item.price;

            const expirationDate = item.expirationDuration
              ? Date.now() + item.expirationDuration
              : null;

            const newItem = {
              name: item.name,
              description: item.description,
              multiplier: item.multiplier,
              luckboost: item.luckBoost,
              type: item.type,
              expirationDate,
              isUnique: item.isUnique,
            };

            if (item.type === "coin_multiplier") {
              newItem.multiplier = item.multiplier;
            } else if (item.type === "luck_booster") {
              newItem.luckboost = item.luckboost;
            } else if (item.type === "no_tax") {
              newItem.notaxAmt = item.notaxAmt;
            }

            user.items.push(newItem);
            await user.save();

            if (expirationDate) {
              setTimeout(async () => {
                try {
                  const updatedUser = await User.findOne({
                    userId: interaction.user.id,
                  });

                  if (updatedUser) {
                    updatedUser.items = updatedUser.items.filter((userItem) =>
                      userItem.expirationDate
                        ? userItem.expirationDate > Date.now()
                        : true
                    );

                    // Remove the item from the database if expired
                    await User.updateOne(
                      { userId: interaction.user.id },
                      {
                        $pull: {
                          items: { expirationDate: { $lt: Date.now() } },
                        },
                      }
                    );

                    await updatedUser.save();
                  }
                } catch (error) {
                  consola.error(c.red('Error removing expired item:' + error));
                }
              }, item.expirationDuration);
            }

            const confirmationEmbed = new EmbedBuilder()
              .setColor(existingGuild.config.embedColor)
              .setTitle("Purchase Confirmation")
              .setDescription(
                `You successfully bought **${item.name}** for **${item.price} coins**!`
              )
              .addFields(
                {
                  name: "Effect",
                  value: item.description || "No effect",
                },
                {
                  name: "Unique Item",
                  value: embedUnique,
                },
                {
                  name: "Expiration",
                  value: itemExp ? itemExp : "Never",
                }
              )
              .setTimestamp();

            await i.update({
              embeds: [confirmationEmbed],
              components: [],
            });
            return;
          }

          await i.update({
            embeds: [generateEmbed(page)],
            components: generateComponents(page),
          });
        } catch (error) {
          consola.error(c.red('Error handling interaction:' + error));
          if (error.code === 10008) {
            await i.reply({
              content:
                "The message you were interacting with no longer exists.",
              ephemeral: true,
            });
          } else {
            await i.reply({
              content: "An error occurred while processing your request.",
              ephemeral: true,
            });
          }
        }
      });

      collector.on("end", () => {
        embedMessage.edit({
          components: [],
        });
      });
    } catch (error) {
      consola.error(c.red('Error executing shop command:' + error));
      await interaction.reply({
        content: "An error occurred while processing the shop command.",
        ephemeral: true,
      });
    }
  },
};
