module.exports = {
  name: "error",
  async execute(error) {
    console.error('An error occurred:', error);
  },
};
