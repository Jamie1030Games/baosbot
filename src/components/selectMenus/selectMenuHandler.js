const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const commands = {
  fun: [
    { name: "8ball", description: "Ask and you shall receive. Sends a response to your questions.", permissions: "None" },
    { name: "coinflip", description: "Flips a coin to help you with those tough decisions.", permissions: "None" },
    { name: "cuddle", description: "Cuddle anyone to show your love.", permissions: "None" },
    { name: "diceroll", description: "Need a number between 1-6? Just roll a dice!", permissions: "None" },
    { name: "fact", description: "Sends a random fact.", permissions: "None" },
    { name: "highfive", description: "Give someone a really loud high five.", permissions: "None" },
    { name: "hug", description: "A warm embrace for anyone you desire.", permissions: "None" },
    { name: "joke", description: "Sends a random joke.", permissions: "None" },
    { name: "kiss", description: "Kiss anyone you want. They might hit you, though.", permissions: "None" },
    { name: "meme", description: "Sends a random meme.", permissions: "None" },
    { name: "pat", description: "Pat someone's head like the freak you are.", permissions: "None" },
    { name: "poke", description: "Poke someone where it hurts.", permissions: "None" },
    { name: "ship", description: "Ship any two people and see how compatible they are.", permissions: "None" },
    { name: "quote", description: "Sends a random quote.", permissions: "None" },
    { name: "slap", description: "Slap someone if you really want to send a message.", permissions: "None" },
  ],
  economy: [
    { name: "addcoins", description: "Adds coins to the desired user. Stimulates economy.", permissions: "Administrator" },
    { name: "balance", description: "See how many coins you or another user has.", permissions: "None" },
    { name: "daily", description: "Get a daily dose of coins.", permissions: "None" },
    { name: "leaderboard", description: "See the top coin-havers.", permissions: "None" },
    { name: "items", description: "See how many items you have.", permissions: "None" },
    { name: "lottery", description: "Bet a certain amount of money for a chance to win. The higher the risk, the higher the reward.", permissions: "None" },
    { name: "shop", description: "Shop for various items and other objects of desire.", permissions: "None" },
    { name: "transfer", description: "Transfer coins between you and another member. Has a 5% tax!", permissions: "None" },
    { name: "listitems", description: "List all items in the bot's database, including ones that are no longer available.", permissions: "None" },
  ],
  moderator: [
    { name: "ban", description: "Bans a user from the server, deleting their messages.", permissions: "Administrator" },
    { name: "kick", description: "Kicks a user from the server.", permissions: "Moderator" },
    { name: "mute", description: "Mutes a server member for a specified amount of time.", permissions: "Moderator" },
    { name: "lockdown", description: "Locks a channel down, with an optional duration.", permissions: "Manage Channels" },
    { name: "purge", description: "Deletes a select number of messages from a channel.", permissions: "Moderator" },
  ],
  other: [
    { name: "userinfo", description: "Shows information about a desired user.", permissions: "None" },
    { name: "server", description: "Shows interesting info about your server.", permissions: "None" },
    { name: "ping", description: "Check the bot latency.", permissions: "None" },
    { name: "poll", description: "Creates a poll for members to interact with.", permissions: "Manage Messages" },
    { name: "reminder", description: "Sets a personal reminder that gets DMed to you at the desired time.", permissions: "None" },
    { name: "level", description: "Shows your own or a desired members level.", permissions: "None" },
    { name: "leaderboard", description: "Shows the top users from all servers in different categories.", permissions: "None" },
    { name: "config", description: "Configurate the bot for your server.", permissions: "Admin" },
    { name: "avatar", description: "View the avatar of any desired person.", permissions: "None" },
    { name: "Other Information", description: "Your level and coins are saved throughout the bot and are not unique to each server." },
  ],
};

module.exports = {
  customId: 'help_select', // The consistent customId

  async execute(interaction) {
    const userId = interaction.client.userId;

    if (interaction.user.id !== userId) {
      return interaction.reply({ content: "You cannot interact with this menu.", ephemeral: true });
    }

    const selectedCategory = interaction.values[0];
    const commandList = commands[selectedCategory] || [];

    if (commandList.length === 0) {
      return await interaction.update({
        content: "No commands available for this category.",
        components: [],
        embeds: [],
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Commands`)
      .setDescription(commandList.map(cmd => `**${cmd.name}:** ${cmd.description}`).join('\n'))
      .setColor("#0099ff");

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("help_select") // Keep the customId consistent
        .setPlaceholder('Select a category')
        .addOptions([
          { label: "Fun", value: "fun" },
          { label: "Economy", value: "economy" },
          { label: "Moderator", value: "moderator" },
          { label: "Miscellaneous", value: "other" },
        ])
    );

    await interaction.update({
      embeds: [embed],
      components: [row],
    });
  },
};
