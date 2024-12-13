const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const memoryManager = require('../memoryManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-personality')
        .setDescription('Sets the bot\'s personality.')
        .addStringOption(option => 
            option.setName('personality')
                .setDescription('The new personality description for the bot.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const newPersonality = interaction.options.getString('personality');

        try {
            memoryManager.setSharedPersonality(newPersonality);
            await interaction.reply({ content: 'Personality has been updated successfully.', ephemeral: false });
        } catch (error) {
            console.error('Error setting personality:', error);
            await interaction.reply({ content: 'There was an error setting the personality.', ephemeral: true });
        }
    },
};
