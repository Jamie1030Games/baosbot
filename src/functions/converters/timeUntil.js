const convertMilliseconds = require('./convertMilliseconds');

function timeUntil(msInFuture) {
  const now = Date.now();
  const difference = msInFuture - now;

  if (difference < 0) {
    return 'Expired'; // Default to "Expired" if the time has passed
  }

  return convertMilliseconds(difference);
}

module.exports = timeUntil;
