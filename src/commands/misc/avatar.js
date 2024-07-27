const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Displays a user\'s avatar')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user\'s avatar to show')
                .setRequired(false)),
                
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 512 });

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setImage(avatarURL)
            .setColor('#3498db');

        await interaction.reply({ embeds: [embed] });
    }
};
