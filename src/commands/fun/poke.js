const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Guild = require('../../schemas/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poke')
        .setDescription('Poke someone')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to poke')
                .setRequired(true)),

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
        const target = interaction.options.getUser('target');
        const pokeGIF = 'https://i.giphy.com/oUVWY10segGkw.webp'; // Example GIF URL

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} pokes ${target.username}!`)
            .setImage(pokeGIF)
            .setColor(existingGuild.config.embedColor);

        await interaction.reply({ embeds: [embed] });
    }
};
