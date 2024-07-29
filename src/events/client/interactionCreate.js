const { consola } = require("consola");
const c = require('ansi-colors');

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        consola.error(c.red(error));
        await interaction.reply({
          content: `Something went totally wrong while doing that, hun.`,
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      const { buttons } = client;
      const { customId } = interaction;
      const button = buttons.get(customId);
      if (!button) return new Error("A glitch happened involving buttons!");

      try {
        await button.execute(interaction, client);
      } catch (error) {
        consola.error(c.red(error));
      }
    } else if (interaction.isStringSelectMenu()) {
      const { selectMenus } = client;
      const { customId } = interaction;
      const menu = selectMenus.get(customId);
      if (!menu) return new Error("A glitch happened involving select menus!");
      try {
        await menu.execute(interaction, client);
      } catch (error) {
        consola.error(c.red(error));
      }
    }
  },
};
