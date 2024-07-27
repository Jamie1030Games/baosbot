const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cuddle')
        .setDescription('Cuddle someone')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to cuddle')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const cuddleGIF = 'https://i.giphy.com/vjKrEyy2NVblS.webp'; // Example GIF URL

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} cuddles ${target.username}!`)
            .setImage(cuddleGIF)
            .setColor('#FFB6C1');

        await interaction.reply({ embeds: [embed] });
    }
};
