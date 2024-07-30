const { SlashCommandBuilder } = require("@discordjs/builders");
const { consola } = require("consola");
const c = require('ansi-colors');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Item = require('../../schemas/item');
const Guild = require('../../schemas/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('edititem')
    .setDescription('Edit an item in the database')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addStringOption(option =>
      option.setName('name')
            .setDescription('Name of the item to edit')
            .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('field')
            .setDescription('Field to edit (look at schema)')
            .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('value')
            .setDescription('New value for the field')
            .setRequired(true)
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
    const itemName = interaction.options.getString('name');
    const field = interaction.options.getString('field');
    const value = interaction.options.getString('value');

    try {
      // Fetch the item from the database
      const item = await Item.findOne({ name: itemName });

      if (!item) {
        return interaction.reply({
          content: `Item with the name "${itemName}" not found.`,
          ephemeral: true,
        });
      }

      // Validate and update the field
      const validFields = ['name', 'description', 'price', 'expirationDuration', 'multiplier', 'luckBoost', 'type', 'isUnique', 'isOffSale', 'deal.percentOff', 'deal.hasDeal'];
      if (!validFields.includes(field)) {
        return interaction.reply({
          content: `Invalid field "${field}". Valid fields are ${validFields.join(', ')}.`,
          ephemeral: true,
        });
      }

      // Handle nested fields for deal
      if (field.startsWith('deal.')) {
        const dealField = field.split('.')[1];
        item.deal[dealField] = value;
      } else {
        if (['price', 'expirationDuration', 'multiplier', 'luckBoost'].includes(field)) {
          item[field] = parseFloat(value);
        } else if (['isUnique', 'isOffSale', 'deal.hasDeal'].includes(field)) {
          item[field] = value.toLowerCase() === 'true';
        } else {
          item[field] = value;
        }
      }

      await item.save();

      const embed = new EmbedBuilder()
        .setColor(existingGuild.config.embedColor)
        .setTitle('Item Edited')
        .setDescription(`The item "${itemName}" has been updated.`)
        .addFields(
          { name: 'Field', value: field, inline: true },
          { name: 'New Value', value: value, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      consola.error(c.red('Error editing item:' + error));
      await interaction.reply({
        content: 'An error occurred while editing the item.',
        ephemeral: true,
      });
    }
  },
};
