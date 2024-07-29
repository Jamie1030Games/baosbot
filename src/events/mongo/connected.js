const c = require('ansi-colors');
const { consola } = require("consola");

module.exports = {
   name: 'connected',
   execute() {
      consola.success(c.green('[DATABASE CONNECTED]'));
   },
};