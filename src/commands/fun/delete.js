const { SlashCommandBuilder } = require('@discordjs/builders');
const canvafy = require('canvafy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('"Deletes" a user that you hate.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to erase')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const targetPfp = target.displayAvatarURL({ dynamic: true, size: 512 });

        const deleteImg = await canvafy.Image.delete(targetPfp);

        await interaction.reply({ files: [
            {
              attachment: deleteImg,
              name: `delete-${target.id}.png`,
            },
          ], });
    }
};
