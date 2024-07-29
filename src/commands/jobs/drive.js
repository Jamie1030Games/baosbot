const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, AttachmentBuilder } = require('discord.js');
const path = require('path');
const Guild = require('../../schemas/guild'); // Adjust path if necessary
const { consola } = require("consola");
const c = require('ansi-colors');

const directions = ['turn_left', 'straight', 'turn_right'];

function generateRandomSequence(length) {
  return Array.from({ length }, () => directions[Math.floor(Math.random() * directions.length)]);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('driving')
    .setDescription('Play a driving game by replicating a sequence of directions.'),

  async execute(interaction) {
    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    const embedColor = guildConfig?.config?.embedColor || '#0099ff'; // Default color if not set

    const sequence = generateRandomSequence(6);
    const sequenceString = sequence.map(dir => dir.replace('turn_', '')).join(', ');

    const sequenceEmbed = new EmbedBuilder()
      .setTitle('Driving Game')
      .setDescription(`Remember this sequence: **${sequenceString}**`)
      .setColor(embedColor);

    const sendSequence = await interaction.reply({ embeds: [sequenceEmbed] });

    setTimeout(() => {
        try {
            sendSequence.delete();
        } catch (error) {
            consola.error(c.red(error));
        }
    }, 5000);
    setTimeout(async () => {
      const initialImage = new AttachmentBuilder(path.join(__dirname, '..', '..', 'commands', 'images', 'straight.png'));

      const steerEmbed = new EmbedBuilder()
        .setTitle('Driving Game')
        .setDescription('Replicate the sequence using the buttons below.')
        .setColor(embedColor)
        .setImage('attachment://straight.png');

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('turn_left')
          .setLabel('Turn Left')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('straight')
          .setLabel('Go Straight')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('turn_right')
          .setLabel('Turn Right')
          .setStyle(ButtonStyle.Primary)
      );

      const gameMessage = await interaction.followUp({
        embeds: [steerEmbed],
        files: [initialImage],
        components: [row],
        fetchReply: true,
      });

      const filter = i => directions.includes(i.customId) && i.user.id === interaction.user.id;
      const collector = gameMessage.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 30000, // 30 seconds
      });

      let userSequence = [];

      collector.on('collect', async i => {
        userSequence.push(i.customId);

        const imagePath = path.join(__dirname, '..', '..', 'commands', 'images', `${i.customId}.png`);
        const image = new AttachmentBuilder(imagePath);

        const updatedEmbed = new EmbedBuilder()
          .setTitle('Driving Game')
          .setDescription(`You selected: **${i.customId.replace('turn_', '')}**`)
          .setColor(embedColor)
          .setImage(`attachment://${i.customId}.png`);

        await i.update({
          embeds: [updatedEmbed],
          files: [image],
          components: [row],
        });

        if (userSequence.length === sequence.length) {
          collector.stop();
        }
      });

      collector.on('end', async collected => {
        if (collected.size === 0) {
          await interaction.followUp({
            content: 'The game has ended due to inactivity.',
            ephemeral: true,
            components: [],
          });
          return;
        }

        const isCorrect = userSequence.every((dir, idx) => dir === sequence[idx]);

        if (isCorrect) {
          await interaction.followUp({ content: 'Congratulations! You replicated the sequence correctly.', ephemeral: true });
        } else {
          await interaction.followUp({ content: `Sorry, you did not replicate the sequence correctly. The correct sequence was: **${sequenceString}**`, ephemeral: true});
        }

        setTimeout(async () => {
          await gameMessage.delete();
        }, 5000);
      });
    }, 5000); // Show the "steer" embed after 5 seconds
  },
};
