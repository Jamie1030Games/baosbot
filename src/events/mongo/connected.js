const c = require('ansi-colors');

module.exports = {
   name: 'connected',
   execute() {
      console.log(c.green('[DATABASE CONNECTED]'));
   },
};