const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../schemas/user');
const handleCoins = require("../../middleware/coinAdder");
const Guild = require('../../schemas/guild');

const DAILY_COINS = 100; // Amount of coins given daily
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily coins'),
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
    const user = await User.findOne({ userId: interaction.user.id });

    const finalPrice = await handleCoins(interaction.user.id, DAILY_COINS);

    if (!user) {
      const newUser = new User({
        userId: interaction.user.id,
        coins: finalPrice,
        lastDaily: Date.now(),
        xp: 0,
        lastMessageTimestamp: Date.now(),
      });
      await newUser.save();

      const dailyEmbed = new EmbedBuilder()
        .setColor(existingGuild.config.embedColor)
        .setTitle('Daily Reward')
        .setDescription(`You have claimed ${finalPrice} coins!`)
        .setTimestamp();

      return interaction.reply({ embeds: [dailyEmbed] });
    }

    const now = Date.now();
    if (user.lastDaily && now - user.lastDaily < DAILY_COOLDOWN) {
      const timeLeft = DAILY_COOLDOWN - (now - user.lastDaily);
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return interaction.reply(`You can claim your daily reward in ${hours} hours and ${minutes} minutes.`);
    }

    console.log(user.lastDaily);
    console.log(now);
    user.coins += finalPrice;
    user.lastDaily = now;
    await user.save();
    
    // Determine if multiplier information should be included
    let description = `You have claimed ${DAILY_COINS} coins!`;
    
    if (finalPrice > DAILY_COINS) {
      const multiplier = (finalPrice / DAILY_COINS).toFixed(2);
      description = `You have claimed ${DAILY_COINS} (${finalPrice} with your active multiplier of ${multiplier}) coins!`;
    }

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(existingGuild.config.embedColor)
      .setTitle('Daily Reward')
      .setDescription(description)
      .setTimestamp();

    // Send the embed
    await interaction.reply({ embeds: [embed] });

  },
};
