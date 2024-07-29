function convertMilliseconds(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    return null;
  }

  const timeUnits = {
    day: 86400000,
    hour: 3600000,
    minute: 60000,
    second: 1000
  };

  const days = Math.floor(ms / timeUnits.day);
  ms %= timeUnits.day;
  const hours = Math.floor(ms / timeUnits.hour);
  ms %= timeUnits.hour;
  const minutes = Math.floor(ms / timeUnits.minute);
  ms %= timeUnits.minute;
  const seconds = Math.floor(ms / timeUnits.second);
  ms %= timeUnits.second;

  const timeComponents = [];
  if (days > 0) timeComponents.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) timeComponents.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) timeComponents.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (seconds > 0) timeComponents.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
  if (ms > 0) timeComponents.push(`${ms} millisecond${ms > 1 ? 's' : ''}`);

  return timeComponents.join(', ');
}

module.exports = convertMilliseconds;
