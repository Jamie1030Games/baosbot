const { ActivityType } = require("discord.js");

module.exports = {
  name: "error",
  async execute(client) {
    console.error('An error occurred:', error);
    try {
        return;
      } catch (error) {
        console.error('Failed to catch error:', error);
      }
  },
};
