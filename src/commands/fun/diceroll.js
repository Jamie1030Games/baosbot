const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls a dice'),

    async execute(interaction) {
        const roll = Math.floor(Math.random() * 6) + 1;

        const embed = new EmbedBuilder()
            .setTitle('Dice Roll')
            .setDescription(`You rolled a ${roll}!`)
            .setColor('#3498db');

        await interaction.reply({ embeds: [embed] });
    }
};
