const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const memoryManager = require('../memoryManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-memory')
        .setDescription('Clears the bot\'s memory.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        try {
            memoryManager.clearMemory();
            await interaction.reply({ content: 'Memory has been cleared successfully.', ephemeral: false });
        } catch (error) {
            console.error('Error clearing memory:', error);
            await interaction.reply({ content: 'There was an error clearing the memory.', ephemeral: true });
        }
    },
};
