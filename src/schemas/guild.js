const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    config: {
        embedColor: {
            type: String,
            default: '#FFFFFF',
        },
        welcomeEnabled: {
            type: String,
            default: 'false',
        },
        welcomeChannel: {
            type: String,
            default: '0'
        },
        verifyEnabled: {
            type: String,
            default: 'false',
        },
        verifyChannel: {
            type: String,
            default: '0',
        },
        verifyRole: {
            type: String,
            default: '0',
        },
        muteRole: {
            type: String,
            default: '0',
        },
        levelEnabled: {
            type: String,
            default: 'true',
        },
        levelChannel: {
            type: String,
            default: '0',
        },
    },
});

module.exports = mongoose.model('Guild', guildSchema);
