/* eslint-disable no-undef */
require("dotenv").config();
const { token, databaseToken } = process.env;
const { connect, mongoose } = require("mongoose");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const logger = require('./utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  allowedMentions: { parse: ["users", "roles"], repliedUser: true },
});
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.commandArray = [];
client.color = "#9ee7d7";

const functionFolders = fs.readdirSync(path.join(__dirname, 'functions'));

for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(path.join(__dirname, 'functions', folder))
    .filter(file => file.endsWith('.js'));

  for (const file of functionFiles) {
    const func = require(path.join(__dirname, 'functions', folder, file));
    
    if (typeof func === 'function') {
      func(client); // Call the function with client if it's valid
    } else {
      console.error(`The file ${file} in folder ${folder} does not export a function.`);
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Bot is shutting down... due to sigint');
  client.destroy();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('Bot is shutting down... due to sigterm');
  client.destroy();
  process.exit();
});

// Handling unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

mongoose.set("strictQuery", false);

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(token);
(async () => {
  await connect(databaseToken).catch(error => logger.error(`Login failed: ${error.message}`));
})();
