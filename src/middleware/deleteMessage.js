// utils.js
const { consola } = require("consola");
const c = require('ansi-colors');

module.exports = {
    deleteMessageAfterTimeout: async (message, timeout) => {
      try {
        // Set a timeout to delete the message
        setTimeout(async () => {
          try {
            await message.delete();
          } catch (error) {
            consola.error(c.red('Failed to delete message:' + error));
          }
        }, timeout);
      } catch (error) {
        consola.error(c.red('Error setting timeout:' + error));
      }
    }
  };
  