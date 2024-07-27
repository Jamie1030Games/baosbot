const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    function presence1() {
      client.user.setPresence({
        activities: [{ name: `for commands`, type: ActivityType.Watching }],
        status: "online",
      });
    }

    function presence2() {
      client.user.setPresence({
        activities: [{ name: `/help`, type: ActivityType.Playing }],
        status: "online",
      });
    }
    setInterval(() => {
      presence1();
    }, 7500);

    setInterval(() => {
      i = 0;
      if ((i = 0)) {
        presence1();
        i++;
      }
      if ((i = 1)) {
        presence2();
        i--;
      }
    }, 4000);
  },
};
