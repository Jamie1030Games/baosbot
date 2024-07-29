const c = require('ansi-colors');
const { consola } = require("consola");

module.exports = {
   name: 'error',
   execute(err) {
      consola.error(c.red(`[DATABASE ERROR] : ${err}`));
   },
};