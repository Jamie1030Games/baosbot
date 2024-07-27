const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("./src/commands");
    client.commandArray = [];

    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        if (!client.commands) client.commands = new Map();
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
      }
    }

    const clientId = "1265503838295818270";
    const rest = new REST({ version: "10" }).setToken(process.env.token);

    try {
      console.log("Started refreshing application (/) commands.");

      // Get all the guilds the bot is in
      const guilds = client.guilds.cache.map((guild) => guild.id);

      // Iterate over each guild to register commands
      for (const guildId of guilds) {
        try {
          await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: client.commandArray,
          });
          console.log(`Successfully reloaded application (/) commands for guild ID ${guildId}.`);
        } catch (error) {
          console.error(`Failed to register commands for guild ID ${guildId}:`, error);
        }
      }
    } catch (error) {
      console.error("Error refreshing application commands:", error);
    }
  };

  client.on("ready", async () => {
    await client.handleCommands();
  });

  client.on("guildCreate", async (guild) => {
    console.log(`Joined new guild: ${guild.name}`);
    await client.handleCommands();
  });
};
