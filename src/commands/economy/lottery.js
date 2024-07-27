const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const User = require("../../schemas/user");
const handleCoins = require("../../middleware/coinAdder");

// Reward multipliers for each tier
const REWARD_MULTIPLIERS = {
  low: 3, // 200% more than the risk amount
  medium: 5, // 400% more than the risk amount
  high: 10, // 800% more than the risk amount
  jackpot: 50, // 5000% more than the risk amount
};

const MIN_RISK_AMOUNT = 100; // Minimum risk amount required to enter
let LOSS_CHANCE = 0.75; // 75% chance to lose

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lottery")
    .setDescription("Enter the lottery with a chance to win big!")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of coins to risk in the lottery")
        .setRequired(true)
    ),
  async execute(interaction) {
    const riskAmount = interaction.options.getInteger("amount");
    let finalPrice;

    // Ensure the risk amount is valid
    if (riskAmount < MIN_RISK_AMOUNT) {
      return interaction.reply(
        `The amount must be at least ${MIN_RISK_AMOUNT} coins.`
      );
    }

    // Fetch user data
    const user = await User.findOne({ userId: interaction.user.id });

    if (!user || user.coins < riskAmount) {
      return interaction.reply(
        "You do not have enough coins to enter the lottery."
      );
    }

    // Deduct risk amount
    user.coins -= riskAmount;

    let hasWon;

    // Determine lottery result
    let luckBoosterInfo;
    let isLuckItem = user.items.find(
      (item) => item.type === "luck_booster" && item.expirationDate > Date.now()
    );
    if (!isLuckItem || isLuckItem == "undefined" || isLuckItem == null) {
      hasWon = Math.random() > LOSS_CHANCE; // 25% chance to win
    } else {
      luckBoosterInfo = ` (${isLuckItem.luckboost}% greater chance to win with your luck boost)`;
      hasWon = Math.random() > LOSS_CHANCE - isLuckItem.luckboost; // 25% chance to win
    }

    let rewardAmount = 0;
    let rewardTier = "";
    let multiplierInfo = "";

    if (hasWon) {
      // Determine reward tier and amount if won
      rewardTier = getRandomRewardTier();
      const rewardMultiplier = REWARD_MULTIPLIERS[rewardTier];
      rewardAmount = riskAmount * rewardMultiplier;

      finalPrice = await handleCoins(interaction.user.id, rewardAmount);

      // Add reward amount to the user's balance
      user.coins += finalPrice;

      // Check if user has any active multiplier
      const activeMultiplier = user.items.find(
        (item) => item.type === "coin_multiplier"
      );
      if (activeMultiplier) {
        multiplierInfo = ` (${finalPrice.toFixed(
          0
        )} with your active multiplier)`;
      }
    } else {
      rewardTier = "none"; // No reward
    }

    await user.save();

    // Create embed message
    const lotteryEmbed = new EmbedBuilder()
      .setColor(hasWon ? "#FFD700" : "#FF0000") // Gold for win, Red for loss
      .setTitle(hasWon ? "Lottery Result! 🎉" : "Lottery Result 💔")
      .setDescription(
        hasWon
          ? `Congratulations ${
              interaction.user.username
            }! You risked ${riskAmount} coins and won ${rewardAmount.toFixed(
              0
            )} coins${multiplierInfo}${luckBoosterInfo}!`
          : `Sorry ${interaction.user.username}, you risked ${riskAmount} coins but didn't win this time.`
      )
      .addFields(
        { name: "Risk Amount", value: riskAmount.toString(), inline: true },
        {
          name: "Reward Tier",
          value:
            rewardTier.charAt(0).toUpperCase() + rewardTier.slice(1) || "None",
          inline: true,
        },
        { name: "Total Coins", value: user.coins.toString(), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [lotteryEmbed] });
  },
};

// Function to get a random reward tier
function getRandomRewardTier() {
  const tiers = ["low", "medium", "high", "jackpot"];
  const randomIndex = Math.floor(Math.random() * tiers.length);
  return tiers[randomIndex];
}
