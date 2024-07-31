// functions/converters/timeUntil.js
const ms = require('ms');

function timeUntil(date) {
  const now = new Date();
  
  // Check if date is a valid Date object or timestamp
  if (!(date instanceof Date) && typeof date !== 'number') {
    return "Invalid date";
  }

  const targetDate = (date instanceof Date) ? date : new Date(date);
  const duration = targetDate - now;

  if (duration <= 0) return "Expired";

  let formatted = ms(duration, { long: true });

  // Remove milliseconds from the formatted string
  return formatted.replace(/(\d+(\.\d+)?)(ms|milliseconds)?/, "$1").trim();
}

module.exports = timeUntil;
