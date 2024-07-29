const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const User = require("../../schemas/user"); // Adjust the path to your User schema
const Guild = require("../../schemas/guild"); // Adjust the path to your Guild schema
const handleCoins = require("../../middleware/coinAdder");

// Cooldown map to store user cooldowns
const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work to earn some money!"),

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
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    // Check cooldown
    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + 10000; // 10 seconds
      if (Date.now() < expirationTime) {
        const timeLeft = Math.ceil((expirationTime - Date.now()) / 1000);
        return interaction.reply({
          content: `You need to wait ${timeLeft} seconds before using this command again.`,
          ephemeral: true,
        });
      }
    }

    // Set cooldown
    cooldowns.set(userId, Date.now());

    // Fetch the guild settings
    const guildSettings = await Guild.findOne({ guildId });
    const embedColor = guildSettings?.config?.embedColor || "#0099ff";

    // Fetch the user from the database
    let user = await User.findOne({ userId });

    if (!user) {
      // If the user doesn't exist, create a new entry
      user = new User({ userId, guildId, balance: 0 });
    }

    const workPrompts = [
      { prompt: "You played drums on the street and earned", min: 10, max: 50 },
      { prompt: "You mowed the neighbor's lawn and earned", min: 20, max: 100 },
      { prompt: "You cleaned someone's car and earned", min: 30, max: 150 },
      { prompt: "You fixed someone's laptop and earned", min: 50, max: 200 },
      { prompt: "You sold some old clothes and earned", min: 40, max: 180 },
      {
        prompt: "You freelanced your digital art and earned",
        min: 40,
        max: 180,
      },
      {
        prompt: "You created a dodgy-looking abstract statue and earned",
        min: 40,
        max: 180,
      },
      { prompt: "You robbed a bank, and it was a booming success! You earned", min: 1000, max: 2500 },
      { prompt: "You robbed a bank, but it failed! You earned", min: 0, max: 0 },
      { prompt: "You went to a furry convention and sold water and earned", min: 500, max: 2000 },
      { prompt: "You sold drugs to a child and earned", min: 500, max: 2000 },
    ];

    // Select a random prompt
    const workPrompt =
      workPrompts[Math.floor(Math.random() * workPrompts.length)];
    const amount =
      Math.floor(Math.random() * (workPrompt.max - workPrompt.min + 1)) +
      workPrompt.min;

    let finalPrice = await handleCoins(interaction.user.id, amount);
    let multiplierInfo = "";

    const activeMultiplier = user.items.find(
      (item) => item.type === "coin_multiplier"
    );

    if (activeMultiplier) {
      multiplierInfo = ` (${finalPrice.toFixed(
        0
      )} with your active multiplier)`;
    }
    user.coins += finalPrice;
    await user.save();

    // Create an embed with the selected prompt and amount
    const embed = new EmbedBuilder()
      .setTitle("Work Result")
      .setDescription(`${workPrompt.prompt} ${amount} coins${multiplierInfo}!`)
      .setColor(embedColor);

    // Reply to the user with the embed
    await interaction.reply({ embeds: [embed] });
  },
};
