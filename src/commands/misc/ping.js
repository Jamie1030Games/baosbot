const {
    SlashCommandBuilder,
 } = require('discord.js');
 
 module.exports = {
    data: new SlashCommandBuilder()
       .setName('ping')
       .setDescription('Pings the bots server!'),
    async execute(interaction, client) {
        const sentMessage = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sentMessage.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        await interaction.editReply(`🏓 Pong! Latency is ${latency}ms. API Latency is ${apiLatency}ms.`);
    },
 };