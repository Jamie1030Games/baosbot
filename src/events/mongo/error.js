const c = require('ansi-colors');

module.exports = {
   name: 'error',
   execute(err) {
      console.log(c.green(`[DATABASE ERROR] : ${err}`));
   },
};