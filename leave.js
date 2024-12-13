const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { leaveVoiceConnection } = require('../server.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Makes the bot leave the current voice channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await leaveVoiceConnection(interaction);
    },
};
