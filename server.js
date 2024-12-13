require('dotenv').config();
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const prism = require('prism-media');
const fs = require('fs');
const wav = require('wav');
const OpenAI = require('openai');
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const path = require('path');
const memoryManager = require('./memoryManager.js');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const AZURE_SUBSCRIPTION_KEY = process.env.AZURE_SUBSCRIPTION_KEY;
const AZURE_REGION = process.env.AZURE_REGION;

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

let voiceConnection = null;
let currentUser = null;
let isSpeaking = false;
let leaveTimeout = null;

function checkEmptyChannel(channel) {
    console.log(`Channel members count: ${channel.members.size}`);
    return channel.members.size === 1;
}

async function saveWavFile(audioBuffer) {
    const audioFilePath = path.join(__dirname, 'temp_audio.wav');
    console.log('Saving buffered audio to WAV file...');

    return new Promise((resolve, reject) => {
        const writer = new wav.FileWriter(audioFilePath, {
            channels: 1,
            sampleRate: 48000,
            bitDepth: 16
        });

        writer.write(audioBuffer);
        writer.end();

        writer.on('finish', () => {
            console.log('Audio file saved successfully at', audioFilePath);
            resolve(audioFilePath);
        });

        writer.on('error', (error) => {
            console.error('Error saving WAV file:', error);
            reject(error);
        });
    });
}

async function transcribeAudio(audioFilePath, userId) {
    if (isSpeaking) {
        console.log("Bot is currently speaking. Skipping new transcription.");
        return;
    }

    try {
        console.log('Sending to Whisper for transcription...');

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioFilePath),
            model: 'whisper-1'
        });

        if (transcription && typeof transcription.text === 'string') {
            const transcript = transcription.text.trim();
            console.log(`Transcribed text: ${transcript}`);
            await handleChatGPTResponse(transcript, userId);
        } else {
            console.error('Unexpected response format from Whisper:', transcription);
        }

    } catch (error) {
        console.error('Error with Whisper transcription:', error);
    }
}

async function getChatGPTResponse(userId, prompt) {
    console.log('Sending prompt to ChatGPT...');

    let sharedMemory = memoryManager.getSharedMemory();
    const sharedPersonality = memoryManager.getSharedPersonality();

    if (!sharedMemory.conversation_history[userId]) {
        sharedMemory.conversation_history[userId] = [];
    }

    const userMemory = sharedMemory.conversation_history[userId];
    const messages = [
        { role: 'system', content: sharedPersonality },
        ...userMemory,
        { role: 'user', content: prompt }
    ];

    try {
        const response = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: messages,
            max_tokens: 4000,
        });
        console.log('Received response from ChatGPT');
        const responseText = response.choices[0]?.message.content.trim() || 'Sorry, I could not generate a response.';

        userMemory.push({ role: 'user', content: prompt });
        userMemory.push({ role: 'assistant', content: responseText });

        sharedMemory.conversation_history[userId] = userMemory;
        memoryManager.setSharedMemory(sharedMemory);

        return responseText;
    } catch (error) {
        console.error('Error with ChatGPT response:', error);
        return 'Sorry, there was an error generating a response.';
    }
}

async function handleChatGPTResponse(transcript, userId) {
    console.log('Handling ChatGPT response...');

    if (isSpeaking) {
        console.log("Bot is currently speaking. Skipping new request.");
        return;
    }

    const responseText = await getChatGPTResponse(userId, transcript);
    console.log('ChatGPT response: ', responseText);

    const audioFileName = await speakTextAzure(responseText);

    console.log('Playing the response in the voice channel...');
    if (voiceConnection) {
        const player = createAudioPlayer();
        const resource = createAudioResource(audioFileName);

        isSpeaking = true;
        player.play(resource);
        voiceConnection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Finished playing the response.');
            isSpeaking = false;
        });

        player.on('error', (error) => {
            console.error('Error with audio player:', error);
            isSpeaking = false;
        });
    } else {
        console.error("Voice connection not found.");
    }
}

async function speakTextAzure(text) {
    return new Promise((resolve, reject) => {
        console.log('Sending text to Azure TTS...');
        const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SUBSCRIPTION_KEY, AZURE_REGION);
        const audioConfig = sdk.AudioConfig.fromAudioFileOutput('output.mp3');
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        synthesizer.speakTextAsync(
            text,
            (result) => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    console.log("Speech synthesized successfully.");
                    resolve('output.mp3');
                } else {
                    console.error("Speech synthesis failed: ", result.errorDetails);
                    reject(result.errorDetails);
                }
                synthesizer.close();
            },
            (err) => {
                console.error("Speech synthesis error: ", err);
                synthesizer.close();
                reject(err);
            }
        );
    });
}

async function setupVoiceConnection(channel, interaction, initialSharedMemory, initialSharedPersonality) {
    console.log('Joining voice channel...');
    voiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
    });

    memoryManager.setSharedMemory(initialSharedMemory);
    memoryManager.setSharedPersonality(initialSharedPersonality);

    const receiver = voiceConnection.receiver;
    const activeStreams = {};

    const leaveChannel = () => {
        console.log('Executing leaveChannel function...');
        if (voiceConnection) {
            voiceConnection.destroy();
            console.log('Voice connection destroyed.');
        } else {
            console.log('No voice connection to destroy.');
        }
        clearInterval(checkInterval);
        voiceConnection = null;
        leaveTimeout = null;
        console.log('Bot has left the voice channel.');
    };

    const checkInterval = setInterval(() => {
        console.log('Checking if channel is empty...');
        if (voiceConnection && checkEmptyChannel(channel)) {
            console.log('Channel is empty.');
            if (!leaveTimeout) {
                console.log('Starting leave timeout...');
                leaveTimeout = setTimeout(() => {
                    console.log('Leave timeout triggered. Calling leaveChannel...');
                    leaveChannel();
                }, 30000);
            } else {
                console.log('Leave timeout already set.');
            }
        } else {
            if (leaveTimeout) {
                console.log('Channel is not empty. Clearing leave timeout.');
                clearTimeout(leaveTimeout);
                leaveTimeout = null;
            }
        }
    }, 30000);

    receiver.speaking.on('start', (userId) => {
        console.log(`Listening to user: ${userId}`);
        
        if (isSpeaking) {
            console.log("Bot is currently speaking, ignoring user input.");
            return; 
        }
        
        if (leaveTimeout) {
            console.log('Activity detected. Clearing leave timeout...');
            clearTimeout(leaveTimeout);
            leaveTimeout = null;
        }
    
        if (currentUser && currentUser !== userId) {
            console.log(`Another user (${currentUser}) is interacting, ignoring user ${userId}.`);
            return;
        }
    
        if (!currentUser) {
            currentUser = userId;
        }
    
        if (activeStreams[userId]) {
            console.log(`Already recording from user: ${userId}`);
            return;
        }
    
        const opusStream = receiver.subscribe(userId, { end: { behavior: 'manual' } });
        const decoder = new prism.opus.Decoder({ frameSize: 960, channels: 1, rate: 48000 });
        const decodedAudioStream = opusStream.pipe(decoder);
    
        let audioChunks = [];
        let isRecording = false;
    
        activeStreams[userId] = {
            audioStream: decodedAudioStream,
            silenceTimeout: null,
        };
    
        decodedAudioStream.on('data', (chunk) => {
            const rms = Math.sqrt(chunk.reduce((sum, val) => sum + val * val, 0) / chunk.length);
    
            const volumeThreshold = 60;  
            if (rms < volumeThreshold) {
                return;
            }
    
            if (!isRecording) {
                console.log(`Started recording audio from user: ${userId}`);
                isRecording = true;
            }
    
            audioChunks.push(chunk);
    
            if (activeStreams[userId] && activeStreams[userId].silenceTimeout !== null) {
                clearTimeout(activeStreams[userId].silenceTimeout);
            }
    
            activeStreams[userId].silenceTimeout = setTimeout(async () => {
                console.log(`Ending audio stream due to silence for user: ${userId}`);
                decodedAudioStream.emit('end'); 
            }, 1500);
        });
    
        decodedAudioStream.on('end', async () => {
            console.log(`Audio stream ended for user: ${userId}`);
    
            if (audioChunks.length > 0) {
                const audioBuffer = Buffer.concat(audioChunks);
                const audioFilePath = await saveWavFile(audioBuffer);
                const transcript = await transcribeAudio(audioFilePath, userId);
                if (transcript) {
                    await handleChatGPTResponse(transcript, userId);
                }
            } else {
                console.log('No audio recorded, skipping transcription.');
            }
    
            if (activeStreams[userId]) {
                if (activeStreams[userId].silenceTimeout !== null) {
                    clearTimeout(activeStreams[userId].silenceTimeout);
                }
                delete activeStreams[userId];
            }
    
            if (currentUser === userId) {
                currentUser = null;
            }
        });
    
        decodedAudioStream.on('error', (error) => {
            console.error(`Error in decoded audio stream for user ${userId}:`, error);
            if (activeStreams[userId]) {
                if (activeStreams[userId].silenceTimeout !== null) {
                    clearTimeout(activeStreams[userId].silenceTimeout);
                }
                delete activeStreams[userId];
            }
    
            if (currentUser === userId) {
                currentUser = null;
            }
        });
    });
}

async function leaveVoiceConnection(interaction) {
    if (voiceConnection) {
        voiceConnection.destroy();
        console.log('Voice connection destroyed.');
        voiceConnection = null;
        currentUser = null;
        isSpeaking = false;
        if (leaveTimeout) {
            clearTimeout(leaveTimeout);
            leaveTimeout = null;
        }
        await interaction.reply({ content: 'Left the voice channel.', ephemeral: true });
    } else {
        await interaction.reply({ content: 'I am not connected to any voice channel.', ephemeral: true });
    }
}

module.exports = { 
    setupVoiceConnection,
    leaveVoiceConnection
};

