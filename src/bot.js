/* eslint-disable no-undef */
require("dotenv").config();
const { token, databaseToken } = process.env;
const { connect, mongoose } = require("mongoose");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { consola } = require("consola");
const c = require('ansi-colors');

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

const functionFolders = fs.readdirSync(path.join(__dirname, "functions"));

for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(path.join(__dirname, "functions", folder))
    .filter((file) => file.endsWith(".js"));

  for (const file of functionFiles) {
    const func = require(path.join(__dirname, "functions", folder, file));

    if (typeof func === "function") {
      func(client); // Call the function with client if it's valid
    } else {
      consola.error(
        c.red(`The file ${file} in folder ${folder} does not export a function.`)
      );
    }
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  consola.error(c.red("Uncaught Exception:" + error));
});

// Graceful shutdown
process.on("SIGINT", () => {
  consola.log(c.red("Bot is shutting down... due to sigint"));
  client.destroy();
  process.exit();
});

process.on("SIGTERM", () => {
  a.log(c.red("Bot is shutting down... due to sigterm"));
  client.destroy();
  process.exit();
});

// Handling unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  consola.error(c.red("Unhandled Rejection at:", promise, "reason:", reason));
});

mongoose.set("strictQuery", false);

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(token);
(async () => {
  await connect(databaseToken).catch((error) => consola.error(c.red(error)));
  consola.box(c.bgWhite("bao's bot is online"));
})();
