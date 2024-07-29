const canvafy = require("canvafy");
const Guild = require("../../schemas/guild");
const { consola } = require("consola");
const c = require('ansi-colors');

module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    const welcome = await new canvafy.WelcomeLeave()
      .setAvatar(
        member.user.displayAvatarURL({ forceStatic: true, extension: "png" })
      )
      .setBackground(
        "image",
        "https://www.designyourway.net/blog/wp-content/uploads/2018/11/pastel-background-goo-1536x864.jpg"
      )
      .setTitle("Welcome")
      .setDescription("Welcome to the server. Please read the rules.")
      .setBorder("#2a2e35")
      .setAvatarBorder("#2a2e35")
      .setOverlayOpacity(0.5)
      .build();

    let existingGuild = await Guild.findOne({ guildId: member.guild.id });

    if (!existingGuild) {
      const newGuild = new Guild({
        guildId: member.guild.id,
        config: {
          embedColor: "#FFFFFF", // Default color
        },
      });

      await newGuild.save();
    }

    if (existingGuild) {
      if (existingGuild.config.welcomeEnabled == "true") {
        // Ensure the welcomeChannel is a valid channel ID and the channel exists
        const channel = member.guild.channels.cache.get(
          existingGuild.config.welcomeChannel
        );
        if (channel) {
          channel
            .send({
              content: `Welcome to ${member}!`,
              files: [
                {
                  attachment: welcome,
                  name: `welcome-${member.id}.png`,
                },
              ],
            })
            .catch(console.error); // Handle any potential errors
        } else {
          consola.error(c.red("Welcome channel not found."));
        }
      }
    }
  },
};
