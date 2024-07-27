const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Item = require('../../schemas/item');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listitems')
    .setDescription('List all items in the shop'),

  async execute(interaction) {
    try {
      const items = await Item.find();

      if (items.length === 0) {
        return interaction.reply('No items found.');
      }

      const embed = new EmbedBuilder()
        .setColor('#00FFFF')
        .setTitle('Item List')
        .setDescription('Here are all the items in the shop:')
        .setTimestamp();

      items.forEach(item => {
        embed.addFields(
          { name: item.name, value: `Description: ${item.description}\nPrice: ${item.price}\n` }
        );
      });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error listing items:', error);
      await interaction.reply('An error occurred while listing the items.');
    }
  },
};
