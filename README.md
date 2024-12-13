# Discord Voice Channel Bot

## Introduction

Welcome to the **Discord Voice Channel Bot**! This bot can join Discord voice channels using the OpenAI api and Microsoft's free Text-to-Speech (TTS) services. The bot can transcribe conversations, generate intelligent responses, and communicate verbally within your voice channels. the bot can transcribe conversations, generate intelligent responses, and communicate verbally within your voice channels.

## Features

- **Join Voice Channels:** Easily invite the bot to join your current voice channel.
- **Leave Voice Channels:** Command the bot to gracefully exit voice channels.
- **Transcription:** Convert spoken words into text using OpenAI's Whisper.
- **Intelligent Responses:** Generate context-aware replies with ChatGPT.
- **Text-to-Speech:** Hear responses spoken aloud using Microsoft's Azure TTS.
- **Memory Management:** Clear the bot's memory and customize its personality.

## Installation

Follow these steps to set up the Discord Voice Channel Bot on your server:

### Prerequisites

- **Node.js:** Ensure you have Node.js installed. You can download it from [here](https://nodejs.org/).
- **Discord Bot Token:** Create a Discord bot and obtain its token. Follow the [Discord Developer Portal](https://discord.com/developers/applications) guide.
- **OpenAI API Key:** Sign up for OpenAI and obtain your API key.
- **Microsoft Azure Subscription:** Sign up for Azure and obtain your free subscription key and region for TTS services. watch this [tutorial](https://www.youtube.com/watch?v=dl0amatX5zs)

### Steps

1. **Clone the Repository:**

   ```
   git clone https://github.com/Gemeri/Discord-Voice-Channel-Bot
   ```

2. **Navigate to the Project Directory:**

   ```
   cd Discord-Voice-Channel-Bot
   ```

3. **Install Dependencies:**

   ```
   npm install discord.js @discordjs/voice @discordjs/rest openai microsoft-cognitiveservices-speech-sdk dotenv prism-media wav
   ```

4. **Run Program**

```
node main.js
```

## Setup

**Configure Environment Variables:**

   configure the `example.env` in the root directory of the project:

   ```
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-3.5-turbo
   AZURE_SUBSCRIPTION_KEY=your_azure_subscription_key
   AZURE_REGION=your_azure_region
   ```

   - **DISCORD_TOKEN:** Your Discord bot token.
   - **CLIENT_ID:** Your Discord application's client ID.
   - **OPENAI_API_KEY:** Your OpenAI API key.
   - **OPENAI_MODEL:** The OpenAI model to use (e.g., `gpt-3.5-turbo`).
   - **AZURE_SUBSCRIPTION_KEY:** Your Azure subscription key for TTS.
   - **AZURE_REGION:** Your Azure region (e.g., `eastus`).

   then rename the file to `.env` after configurations have been made

## Usage

Once set up, you can control the bot using the following slash commands within your Discord server:

### Available Commands

1. **/join**
   - **Description:** Makes the bot join your current voice channel.
   - **Permissions:** Accessible to all users.
   - **Usage:** `/join`

2. **/leave**
   - **Description:** Makes the bot leave the current voice channel.
   - **Permissions:** Accessible to all users.
   - **Usage:** `/leave`

3. **/clear-memory**
   - **Description:** Clears the bot's memory, including conversation history and user information.
   - **Permissions:** Restricted to administrators.
   - **Usage:** `/clear-memory`

4. **/set-personality**
   - **Description:** Sets the bot's personality, altering its behavior in voice calls.
   - **Permissions:** Restricted to administrators.
   - **Usage:** `/set-personality personality:"You are a friendly and helpful assistant."`

### Example Workflow

1. **Joining a Voice Channel:**
   - Ensure you are connected to a voice channel in your Discord server.
   - Use the `/join` command.
   - The bot will join your voice channel and start listening.

2. **Interacting in Voice Channel:**
   - Speak in the voice channel.
   - The bot will transcribe your speech, generate a response using ChatGPT, and respond verbally using Azure TTS.

3. **Leaving a Voice Channel:**
   - Use the `/leave` command.
   - The bot will gracefully exit the voice channel.

4. **Managing Bot's Memory and Personality (Administrators Only):**
   - Use `/clear-memory` to reset the bot's memory.
   - Use `/set-personality` to customize the bot's personality.

## How It Works

The Discord Voice Channel Bot integrates several technologies to provide its functionalities:

1. **Discord.js:** Handles interactions with the Discord API, manages events, and processes commands.
2. **@discordjs/voice:** Manages voice connections, allowing the bot to join and interact within voice channels.
3. **OpenAI API (Whisper & ChatGPT):**
   - **Whisper:** Transcribes spoken words from the voice channel into text.
   - **ChatGPT:** Generates intelligent and context-aware responses based on the transcribed text and conversation history.
4. **Microsoft Azure TTS:** Converts the generated text responses into spoken audio, allowing the bot to communicate verbally.
5. **Memory Management:** Maintains conversation history and user information to provide coherent and personalized interactions.

### Interaction Flow

1. **Joining the Voice Channel:**
   - When a user issues the `/join` command, the bot connects to the user's current voice channel.
2. **Listening and Transcribing:**
   - The bot listens to conversations in the voice channel.
   - Using Whisper, it transcribes the audio into text.
3. **Generating Responses:**
   - The transcribed text is sent to ChatGPT, which generates a relevant response.
   - The response is stored in the bot's memory for context in future interactions.
4. **Speaking the Response:**
   - The generated text is sent to Azure's TTS service, converting it into audio.
   - The bot plays the audio response in the voice channel.
5. **Leaving the Voice Channel:**
   - Users can command the bot to leave using `/leave`.
   - The bot disconnects from the voice channel gracefully.

## Contributing

Contributions are welcome! Follow these steps to contribute to the project:

1. **Fork the Repository:**

   ```
   git clone https://github.com/Gemeri/Discord-Voice-Channel-Bot
   ```

2. **Create a New Branch:**

   ```
   git checkout -b feature/YourFeatureName
   ```

3. **Make Your Changes:**

   Implement your features or bug fixes.

4. **Commit Your Changes:**

   ```
   git commit -m "Add your message here"
   ```

5. **Push to Your Fork:**

   ```
   git push origin feature/YourFeatureName
   ```

6. **Create a Pull Request:**

   Submit a pull request detailing your changes.

## License

This project is licensed under the [MIT License](LICENSE).

---
