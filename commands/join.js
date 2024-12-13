const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setupVoiceConnection } = require('../server.js');
const memoryManager = require('../memoryManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Makes the bot join your current voice channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.None),
    async execute(interaction) {
        const member = interaction.member;

        if (!member.voice.channel) {
            return interaction.reply({ content: 'You need to join a voice channel first!', ephemeral: true });
        }

        const channel = member.voice.channel;

        try {
            await setupVoiceConnection(channel, interaction, memoryManager.getSharedMemory(), memoryManager.getSharedPersonality());
            await interaction.reply({ content: `Joined voice channel: **${channel.name}**`, ephemeral: false });
        } catch (error) {
            console.error('Error setting up voice connection:', error);
            await interaction.reply({ content: 'There was an error joining the voice channel. Please try again.', ephemeral: true });
        }
    },
};
