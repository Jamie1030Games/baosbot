const canvafy = require("canvafy");
const Guild = require("../../schemas/guild");

module.exports = {
  name: "guildMemberRemove",
  async execute(member, client) {
    const welcome = await new canvafy.WelcomeLeave()
      .setAvatar(
        member.user.displayAvatarURL({ forceStatic: true, extension: "png" })
      )
      .setBackground(
        "image",
        "https://www.designyourway.net/blog/wp-content/uploads/2018/11/pastel-background-goo-1536x864.jpg"
      )
      .setTitle(`Bye, ${member.user.username}!`)
      .setDescription("We hope you come again!")
      .setBorder("#2a2e35")
      .setAvatarBorder("#2a2e35")
      .setOverlayOpacity(0.3)
      .build();

    let existingGuild = await Guild.findOne({ guildId: member.guild.id });

    if (!existingGuild) {
      const newGuild = new Guild({
        guildId: guild.id,
        config: {
          embedColor: "#FFFFFF", // Default color
        },
      });

      await newGuild.save();
      console.log(`Guild ${guild.id} added to the database.`);
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
              content: `Everyone say goodbye to ${member}!`,
              files: [
                {
                  attachment: welcome,
                  name: `leave-${member.id}.png`,
                },
              ],
            })
            .catch(console.error); // Handle any potential errors
        } else {
          console.error("Welcome channel not found.");
        }
      }
    }
  },
};
