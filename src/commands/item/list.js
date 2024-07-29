const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Item = require('../../schemas/item');
const Guild = require('../../schemas/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listitems')
    .setDescription('List all items in the shop'),

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
    try {
      const items = await Item.find();

      if (items.length === 0) {
        return interaction.reply('No items found.');
      }

      const embed = new EmbedBuilder()
        .setColor(existingGuild.config.embedColor)
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
