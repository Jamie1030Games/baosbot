const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poke')
        .setDescription('Poke someone')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to poke')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const pokeGIF = 'https://i.giphy.com/oUVWY10segGkw.webp'; // Example GIF URL

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} pokes ${target.username}!`)
            .setImage(pokeGIF)
            .setColor('#3498db');

        await interaction.reply({ embeds: [embed] });
    }
};
