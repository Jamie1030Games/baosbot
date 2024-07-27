const c = require('ansi-colors');

module.exports = {
   name: 'connecting',
   execute() {
      console.log(c.cyan('[DATABASE CONNECTING...]'));
   },
};