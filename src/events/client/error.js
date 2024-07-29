const { consola } = require("consola");
const c = require('ansi-colors');

module.exports = {
  name: "error",
  async execute(error) {
    consola.error(c.red('An error occurred:', error));
  },
};
