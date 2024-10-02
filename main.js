// const API_KEY = 'AIzaSyCX-s4eUSP5dQzmXao8RskFT6ZBPNhP9zE';
// const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// const chatMessages = document.getElementById('chat-messages');
// const userInput = document.getElementById('user-input');
// const sendButton = document.getElementById('send-button');
// const stopButton = document.getElementById('stopButton');
// const preferences = document.getElementById('preferences'); 
// const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
// recognition.lang = 'en-IND';
// recognition.interimResults = false;
// recognition.maxAlternatives = 2;

// let voices = [];
// let stopTyping = false;
// let stopSpeaking = false;
// let lastResponse = ''; 
// let voicesCached = false;


// function populateVoiceList() {
//     if (!voicesCached) {
//         voices = window.speechSynthesis.getVoices();
//         voicesCached = true;
//     }
//     const voiceSelect = document.getElementById('voiceSelect');
//     voiceSelect.innerHTML = '';
//     voices.forEach((voice) => {
//         const option = document.createElement('option');
//         option.textContent = `${voice.name} (${voice.lang})`;
//         option.setAttribute('data-name', voice.name);
//         voiceSelect.appendChild(option);
//     });
// }

// if (speechSynthesis.onvoiceschanged !== undefined) {
//     speechSynthesis.onvoiceschanged = populateVoiceList;
// }

// // Handle speech recognition
// recognition.onresult = (event) => {
//     const transcript = event.results[0][0].transcript;
//     userInput.value = transcript;
// };

// // Start listening for voice input
// function startListening() {
//     recognition.start();
// }

// // Function to send the message to the API
// async function sendMessage() {
//     const message = userInput.value.trim();
//     if (message) {
//         addMessage(message, 'user-message');
//         userInput.value = ''; // Clear the input field after sending the message
//         showLoading();
//         stopTyping = false;
//         stopSpeaking = false;
//         try {
//             let aiResponse;
//             if (isIdentityQuestion(message)) {
//                 aiResponse = "I'm Pyxis AI, an advanced language model created by Pyxis. How may I assist you today?";
//             } else {
//                 const enhancedPrompt = `As a professional AI assistant named Pyxis, please provide a thoughtful, accurate, and concise response to the following query or statement. Query: "${message}"`;

//                 const response = await fetchWithRetry(`${API_URL}?key=${API_KEY}`, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ contents: [{ parts: [{ text: enhancedPrompt }] }] })
//                 });
//                 aiResponse = response.candidates[0].content.parts[0].text;
//                 aiResponse = postProcessResponse(aiResponse);
//             }
//             hideLoading();
//             typeMessage(aiResponse, 'ai-message');
//             lastResponse = aiResponse;
//         } catch (error) {
//             console.error('Error:', error);
//             hideLoading();
//             const errorMsg = 'I encountered an error while processing your request. Please try again.';
//             addMessage(errorMsg, 'ai-message');
//         }
//     }
// }

// // Retry logic for API requests
// async function fetchWithRetry(url, options, retries = 3) {
//     for (let i = 0; i < retries; i++) {
//         try {
//             const response = await fetch(url, options);
//             if (!response.ok) throw new Error(`Error: ${response.status}`);
//             return await response.json();
//         } catch (error) {
//             console.error(`Attempt ${i + 1} failed: ${error.message}`);
//             if (i === retries - 1) throw error;
//         }
//     }
// }

// function postProcessResponse(response) {
   
//     response = response.replace(/\*/g, ''); // Remove asterisks
//     response = response.replace(/([A-Z][a-z]+.*:)/g, '\n\n$1\n'); // Add new lines before and after headings (ending with colon)
    
//     response = response.charAt(0).toUpperCase() + response.slice(1);
//     if (response.length > 100) response += "\n\nIs there anything else I can help you with?";
//     return response.trim();
// }

// // Add message to the chat
// function addMessage(text, className) {
//     const messageElement = document.createElement('div');
//     messageElement.classList.add('message', className);
//     messageElement.textContent = text;
//     chatMessages.appendChild(messageElement);
//     chatMessages.scrollTop = chatMessages.scrollHeight;
// }

// function showLoading() {
//     const loadingElement = document.createElement('div');
//     loadingElement.classList.add('loading');
//     loadingElement.innerHTML = '<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>';
//     chatMessages.appendChild(loadingElement);
//     chatMessages.scrollTop = chatMessages.scrollHeight;
// }

// function hideLoading() {
//     const loadingElement = chatMessages.querySelector('.loading');
//     if (loadingElement) loadingElement.remove();
// }

// // Typing animation
// async function typeMessage(text, className) {
//     const messageElement = document.createElement('div');
//     messageElement.classList.add('message', className);
//     chatMessages.appendChild(messageElement);

//     for (let i = 0; i < text.length; i++) {
//         if (stopTyping) break;
//         messageElement.textContent += text[i];
//         chatMessages.scrollTop = chatMessages.scrollHeight;
//         await new Promise(resolve => setTimeout(resolve, 20)); // Typing speed
//     }
// }

// // Voice recognition and speech synthesis
// document.getElementById('talk-button').addEventListener('click', () => {
//     if (lastResponse) speak(lastResponse);
// });

// document.getElementById('listen-button').addEventListener('click', startListening);

// function speak(text) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     const voiceSelect = document.getElementById('voiceSelect');
//     const selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
//     const selectedVoice = voices.find(voice => voice.name === selectedOption);
//     if (selectedVoice) utterance.voice = selectedVoice;

//     utterance.rate = 1.5;
//     utterance.pitch = 1.0;
//     window.speechSynthesis.speak(utterance);

//     stopButton.addEventListener('click', () => {
//         window.speechSynthesis.cancel();
//     });
// }

// function isIdentityQuestion(message) {
//     const lowerMessage = message.toLowerCase();
//     return lowerMessage.includes("who created you") || 
//            lowerMessage.includes("what is your name") || 
//            lowerMessage.includes("who made you") || 
//            lowerMessage.includes("who are you") || 
//            lowerMessage.includes("what's your name");
// }

// // Preferences click handler
// preferences.addEventListener('click', function(event) {
//     const preferenceButton = event.target.closest('.preference-button');
//     if (preferenceButton) {
//         const preference = preferenceButton.dataset.preference;
//         userInput.value = preference;
//         sendMessage(); 
//     }
// });

// sendButton.addEventListener('click', sendMessage);

// userInput.addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') sendMessage();
// });

// stopButton.addEventListener('click', () => {
//     stopTyping = true;
//     recognition.stop();
// });
// Constants
const API_KEY = 'AIzaSyCX-s4eUSP5dQzmXao8RskFT6ZBPNhP9zE';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const listenButton = document.getElementById('listen-button');
const newChatButton = document.querySelector('.new-chat-button');

// State management
let currentChatId = generateChatId();
let chatHistory = new Map();
let isProcessing = false;

// Initialize speech recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = false;
recognition.interimResults = false;

// Enhanced prompt engineering with structured response guidance
function createEnhancedPrompt(message, context = []) {
    return {
        contents: [{
            parts: [{
                text: `You are Pyxis AI, a helpful and knowledgeable assistant. Please provide a clear, structured response using:
                - Headings with colons
                - Bullet points using • symbol
                - Numbered lists where appropriate
                - CAPS for important information
                - Clear paragraphs with line breaks

                Previous context: ${context.join(' ')}
                Current message: ${message}`
            }]
        }]
    };
}

// API interaction with retry mechanism
async function fetchAIResponse(prompt, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(prompt)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// Enhanced message rendering with formatting
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'user' ? 'U' : 'AI';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Format AI responses
    if (type === 'ai') {
        // Remove any asterisks from the text
        text = text.replace(/\*/g, '');
        
        // Split response into sections
        const sections = text.split('\n\n');
        
        sections.forEach(section => {
            if (section.trim()) {
                // Handle headings (lines ending with ':')
                if (section.trim().match(/^.+:$/m)) {
                    const heading = document.createElement('h3');
                    heading.style.fontWeight = 'bold';
                    heading.style.fontSize = '1.2em';
                    heading.style.marginTop = '1em';
                    heading.textContent = section.trim();
                    content.appendChild(heading);
                }
                // Handle bullet points
                else if (section.includes('•')) {
                    const ul = document.createElement('ul');
                    ul.style.marginLeft = '20px';
                    section.split('\n').forEach(line => {
                        if (line.trim()) {
                            const li = document.createElement('li');
                            li.textContent = line.replace('•', '').trim();
                            ul.appendChild(li);
                        }
                    });
                    content.appendChild(ul);
                }
                // Handle numbered lists
                else if (section.match(/^\d+\./m)) {
                    const ol = document.createElement('ol');
                    ol.style.marginLeft = '20px';
                    section.split('\n').forEach(line => {
                        if (line.trim()) {
                            const li = document.createElement('li');
                            li.textContent = line.replace(/^\d+\./, '').trim();
                            ol.appendChild(li);
                        }
                    });
                    content.appendChild(ol);
                }
                // Handle important text (in caps)
                else if (section.match(/[A-Z]{3,}/)) {
                    const p = document.createElement('p');
                    p.innerHTML = section.replace(/([A-Z]{3,})/g, '<strong style="color: #ff4444">$1</strong>');
                    content.appendChild(p);
                }
                // Regular paragraphs
                else {
                    const p = document.createElement('p');
                    p.textContent = section;
                    p.style.marginBottom = '0.5em';
                    content.appendChild(p);
                }
            }
        });
    } else {
        // User messages remain unchanged
        content.textContent = text;
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Message handling with improved context
async function sendMessage() {
    if (isProcessing) return;
    
    const message = userInput.value.trim();
    if (!message) return;

    isProcessing = true;
    userInput.value = '';
    userInput.style.height = 'auto';

    // Add user message
    addMessage(message, 'user');

    // Get recent context
    const recentMessages = Array.from(chatMessages.children)
        .slice(-4)
        .map(msg => msg.querySelector('.message-content').textContent);

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message loading';
    loadingDiv.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="loading">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();

    try {
        const prompt = createEnhancedPrompt(message, recentMessages);
        const aiResponse = await fetchAIResponse(prompt);
        
        // Process and clean the response
        const processedResponse = aiResponse
            .trim()
            .replace(/^As Pyxis AI,?/i, '')
            .replace(/^I would respond:?/i, '')
            .trim();

        loadingDiv.remove();
        addMessage(processedResponse, 'ai');

        // Save to chat history
        saveChat(currentChatId, Array.from(chatMessages.children).map(msg => ({
            type: msg.classList.contains('user-message') ? 'user' : 'ai',
            content: msg.querySelector('.message-content').textContent
        })));

        updateChatList();
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.remove();
        addMessage('I apologize, but I encountered an error. Please try asking your question again.', 'ai');
    } finally {
        isProcessing = false;
    }
}

// Utility functions
function generateChatId() {
    return `chat_${Date.now()}`;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveChat(chatId, messages) {
    chatHistory.set(chatId, messages);
    try {
        localStorage.setItem('chatHistory', JSON.stringify([...chatHistory]));
    } catch (e) {
        console.error('Error saving chat history:', e);
    }
}

function loadChatHistory() {
    try {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            chatHistory = new Map(JSON.parse(saved));
            updateChatList();
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
        chatHistory = new Map();
    }
}

function updateChatList() {
    const chatList = document.querySelector('.chat-list');
    if (!chatList) return;
    
    chatList.innerHTML = '';
    chatHistory.forEach((messages, chatId) => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${chatId === currentChatId ? 'active' : ''}`;
        chatItem.textContent = messages[0]?.content?.slice(0, 30) + '...' || 'New Chat';
        chatItem.onclick = () => loadChat(chatId);
        chatList.appendChild(chatItem);
    });
}

function loadChat(chatId) {
    currentChatId = chatId;
    chatMessages.innerHTML = '';
    const messages = chatHistory.get(chatId) || [];
    messages.forEach(msg => addMessage(msg.content, msg.type));
    updateChatList();
}

// Event listeners
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
});

sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

listenButton.addEventListener('click', () => {
    recognition.start();
});

newChatButton.addEventListener('click', () => {
    currentChatId = generateChatId();
    chatMessages.innerHTML = '';
    addMessage('Hello! I\'m Pyxis AI. How can I help you today?', 'ai');
    updateChatList();
});

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    if (!chatHistory.has(currentChatId)) {
        addMessage('Hello! I\'m Pyxis AI. How can I help you today?', 'ai');
    }
});