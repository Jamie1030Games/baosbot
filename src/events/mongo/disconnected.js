const c = require('ansi-colors');

module.exports = {
   name: 'disconnected',
   execute() {
      console.log(c.red('[DATABASE DISCONNECTED]'));
   },
};