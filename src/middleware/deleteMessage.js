// utils.js
module.exports = {
    deleteMessageAfterTimeout: async (message, timeout) => {
      try {
        // Set a timeout to delete the message
        setTimeout(async () => {
          try {
            await message.delete();
            console.log('Message deleted.');
          } catch (error) {
            console.error('Failed to delete message:', error);
          }
        }, timeout);
      } catch (error) {
        console.error('Error setting timeout:', error);
      }
    }
  };
  