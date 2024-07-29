const Guild = require('../../schemas/guild');
const { consola } = require("consola");
const c = require('ansi-colors');

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
                consola.log(c.red(`Guild ${guild.id} added to the database.`));
            }
        } catch (error) {
            consola.error(c.red(`Error adding guild ${guild.id} to the database:`, error));
        }
    },
};
