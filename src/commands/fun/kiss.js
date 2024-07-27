const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Send a virtual kiss to someone')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to kiss')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const kissGIF = 'https://i.giphy.com/9G0AdBbVrkV3O.webp'; // Example GIF URL

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} sends a kiss to ${target.username}!`)
            .setImage(kissGIF)
            .setColor('#ff69b4');

        await interaction.reply({ embeds: [embed] });
    }
};
