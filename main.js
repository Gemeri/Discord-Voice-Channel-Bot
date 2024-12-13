require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const memoryManager = require('./memoryManager.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Channel],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function registerCommandsForGuild(guildId) {
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands },
        );
        console.log(`Successfully registered commands for guild ID ${guildId}.`);
    } catch (error) {
        console.error(`Failed to register commands for guild ID ${guildId}:`, error);
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    memoryManager.loadSharedData();

    const guilds = client.guilds.cache.map(guild => guild.id);
    for (const guildId of guilds) {
        await registerCommandsForGuild(guildId);
    }
});

client.on('guildCreate', async guild => {
    console.log(`Joined new guild: ${guild.name} (ID: ${guild.id})`);
    await registerCommandsForGuild(guild.id);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error executing that command.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
        }
    }
});

setInterval(memoryManager.saveSharedData, 60000);

client.login(process.env.DISCORD_TOKEN);
