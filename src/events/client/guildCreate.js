const Guild = require('../../schemas/guild');

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        try {
            let existingGuild = await Guild.findOne({ guildId: guild.id });

            if (!existingGuild) {
                const newGuild = new Guild({
                    guildId: guild.id,
                    config: {
                        embedColor: '#FFFFFF', // Default color
                    },
                });

                await newGuild.save();
                console.log(`Guild ${guild.id} added to the database.`);
            }
        } catch (error) {
            console.error(`Error adding guild ${guild.id} to the database:`, error);
        }
    },
};
