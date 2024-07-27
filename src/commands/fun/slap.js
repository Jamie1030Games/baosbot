const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slap')
        .setDescription('Slap someone')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to slap')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const slapGIF = 'https://i.giphy.com/uG3lKkAuh53wc.webp'; // Example GIF URL

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} slaps ${target.username}!`)
            .setImage(slapGIF)
            .setColor('#ff0000');

        await interaction.reply({ embeds: [embed] });
    }
};
