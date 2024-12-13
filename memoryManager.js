const fs = require('fs');
const path = require('path');

let sharedMemory = { conversation_history: {}, user_info: {} };
let sharedPersonality = "You are a helpful assistant.";

function loadSharedData() {
    try {
        const memoryData = fs.readFileSync(path.join(__dirname, 'memory.json'), 'utf-8');
        const personalityData = fs.readFileSync(path.join(__dirname, 'personality.json'), 'utf-8');
        sharedMemory = JSON.parse(memoryData);
        sharedPersonality = JSON.parse(personalityData).personality;
    } catch (error) {
        console.error('Error loading shared data:', error);
        sharedMemory = { conversation_history: {}, user_info: {} };
        sharedPersonality = "You are a helpful assistant.";
    }
}

function saveSharedData() {
    try {
        fs.writeFileSync(path.join(__dirname, 'memory.json'), JSON.stringify(sharedMemory, null, 2));
        fs.writeFileSync(path.join(__dirname, 'personality.json'), JSON.stringify({ personality: sharedPersonality }, null, 2));
    } catch (error) {
        console.error('Error saving shared data:', error);
    }
}

function clearMemory() {
    sharedMemory = { conversation_history: {}, user_info: {} };
    saveSharedData();
}

function getSharedMemory() {
    return sharedMemory;
}

function setSharedMemory(newMemory) {
    sharedMemory = newMemory;
    saveSharedData();
}

function getSharedPersonality() {
    return sharedPersonality;
}

function setSharedPersonality(newPersonality) {
    sharedPersonality = newPersonality;
    saveSharedData();
}

function updateUserInfo(userId, username) {
    if (!sharedMemory.user_info[userId]) {
        sharedMemory.user_info[userId] = {};
    }
    sharedMemory.user_info[userId].name = username;
    saveSharedData();
}

module.exports = {
    loadSharedData,
    saveSharedData,
    clearMemory,
    getSharedMemory,
    setSharedMemory,
    getSharedPersonality,
    setSharedPersonality,
    updateUserInfo
};
