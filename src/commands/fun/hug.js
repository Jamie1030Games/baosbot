const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Send a virtual hug to someone')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to hug')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const hugGIF = 'https://i.giphy.com/l8ooOxhcItowwLPuZn.webp'; // Example GIF URL

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} sends a hug to ${target.username}!`)
            .setImage(hugGIF)
            .setColor('#ff69b4');

        await interaction.reply({ embeds: [embed] });
    }
};
