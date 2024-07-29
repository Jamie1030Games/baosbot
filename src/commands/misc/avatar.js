const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Guild = require('../../schemas/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Displays a user\'s avatar')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user\'s avatar to show')
                .setRequired(false)),
                
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
        const user = interaction.options.getUser('target') || interaction.user;
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 512 });

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setImage(avatarURL)
            .setColor(existingGuild.config.embedColor);

        await interaction.reply({ embeds: [embed] });
    }
};
