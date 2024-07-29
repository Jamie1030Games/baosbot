/* eslint-disable no-undef */
const { readdirSync } = require('fs');
const path = require('path');
const { consola } = require("consola");
const c = require('ansi-colors');

module.exports = (client) => {
  client.handleComponents = async () => {
    const componentFolders = readdirSync('./src/components');

    for (const folder of componentFolders) {
      const componentFiles = readdirSync(path.join(__dirname, '../../components', folder))
        .filter(file => file.endsWith('.js'));

      const { buttons, selectMenus } = client;

      switch (folder) {
        case 'buttons':
          for (const file of componentFiles) {
            try {
              const button = require(path.join(__dirname, '../../components', folder, file));
              if (button.data && button.data.name) {
                buttons.set(button.data.name, button);
              } else {
                consola.warn(c.yellow(`Skipping file ${file}: Missing data.name`));
              }
            } catch (error) {
              consola.error(c.red(`Error loading button ${file}:`, error));
            }
          }
          break;

        case 'selectMenus':
          for (const file of componentFiles) {
            try {
              const menu = require(path.join(__dirname, '../../components', folder, file));
              if (menu.customId && typeof menu.execute === 'function') {
                selectMenus.set(menu.customId, menu);
              } else {
                consola.warn(c.yellow(`Skipping file ${file}: Missing customId or execute function`));
              }
            } catch (error) {
              consola.error(c.red(`Error loading select menu ${file}:`, error));
            }
          }
          break;

        default:
          break;
      }
    }
  };
};
