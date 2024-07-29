const c = require('ansi-colors');
const { consola } = require("consola");

module.exports = {
   name: 'connecting',
   execute() {
      consola.info(c.cyan('[DATABASE CONNECTING...]'));
   },
};