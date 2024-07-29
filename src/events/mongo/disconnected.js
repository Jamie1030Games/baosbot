const c = require('ansi-colors');
const { consola } = require("consola");

module.exports = {
   name: 'disconnected',
   execute() {
      consola.warn(c.yellow('[DATABASE DISCONNECTED]'));
   },
};