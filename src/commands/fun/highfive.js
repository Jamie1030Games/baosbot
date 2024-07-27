const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('highfive')
        .setDescription('Give a high five to someone')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to high five')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const highFiveGIF = 'https://i.giphy.com/s4VoCsFz8prlhSFCeS.webp'; // Example GIF URL

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} gives a high five to ${target.username}!`)
            .setImage(highFiveGIF)
            .setColor('#FFD700');

        await interaction.reply({ embeds: [embed] });
    }
};
