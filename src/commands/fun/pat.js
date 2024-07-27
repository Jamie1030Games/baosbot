const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pat')
        .setDescription('Pat someone')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to pat')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const patGIF = 'https://i.giphy.com/xUA7bahIfcCqC7S4qA.webp'; // Example GIF URL

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} pats ${target.username}!`)
            .setImage(patGIF)
            .setColor('#ADD8E6');

        await interaction.reply({ embeds: [embed] });
    }
};
