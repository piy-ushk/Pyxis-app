

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
  
// Constants
const API_KEY = 'AIzaSyBMeFzDkp-Wh4IOuFJbFjUT1RwjiH4Ee5E';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const listenButton = document.getElementById('listen-button');
const newChatButton = document.querySelector('.new-chat-button');

let currentSlide = 0;
const totalSlides = document.querySelectorAll('.prompt-card').length;

function moveCarousel(direction) {
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = totalSlides - 1;
    if (currentSlide >= totalSlides) currentSlide = 0;
    
    const carousel = document.querySelector('.prompt-carousel');
    carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function usePrompt(promptText) {
    const userInput = document.getElementById('user-input');
    userInput.value = promptText;
    userInput.focus();
}

// State management
let currentChatId = generateChatId();
// let chatHistory = new Map();
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
                text: `You are Pixio AI created by Piyush, a helpful and knowledgeable assistant. Please provide a clear, structured response using:
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
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const chatContainer = document.querySelector('.chat-container');
    
    // Create and add pin button
    const pinButton = document.createElement('button');
    pinButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-bar-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"/></svg>';
  

    pinButton.className = 'pin-button';
    sidebar.appendChild(pinButton);

    // Create hover area
    const hoverArea = document.createElement('div');
    hoverArea.className = 'sidebar-hover-area';
    document.body.appendChild(hoverArea);

    let isPinned = false;
    let isHovering = false;

    pinButton.addEventListener('click', function() {
        isPinned = !isPinned;
        sidebar.classList.toggle('pinned', isPinned);
        pinButton.classList.toggle('active', isPinned);
        if (isPinned) {
            sidebar.style.left = '0';
        } else {
            sidebar.style.left = isHovering ? '0' : '-280px';
        }
    });

    // Handle sidebar hover
    function showSidebar() {
        if (!isPinned) {
            isHovering = true;
            sidebar.style.left = '0';
        }
    }

    function hideSidebar() {
        if (!isPinned) {
            isHovering = false;
            sidebar.style.left = '-280px';
        }
    }

    hoverArea.addEventListener('mouseenter', showSidebar);
    sidebar.addEventListener('mouseenter', showSidebar);

    sidebar.addEventListener('mouseleave', hideSidebar);
});

function usePrompt(value) {
    const userInput = document.getElementById('user-input');
    userInput.value = value;
}
 // Ensure only 5 chats are displayed, show the rest as hidden
// function limitChatHistory() {
//     const chatItems = document.querySelectorAll('.chat-item');
//     chatItems.forEach((item, index) => {
//         if (index >= 5) {
//             item.style.display = 'none'; // Hide chats after the 5th one
//         }
//     });
// }
// limitChatHistory();

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
    function cleanMarkdownFormatting(text) {
        // Remove bold/italic asterisks
        text = text.replace(/\*{1,3}/g, '');
        
        // Remove underscores used for emphasis
        text = text.replace(/_{1,3}/g, '');
        
        // Remove hashtags from headers
        text = text.replace(/^#{1,6}\s*/gm, '');
        
        // Remove backticks for code
        text = text.replace(/`/g, '');
        
        // Remove blockquotes
        text = text.replace(/^\s*>\s*/gm, '');
        
        // Remove horizontal rules
        text = text.replace(/^\s*[-*_]{3,}\s*$/gm, '');
        
        // Remove inline code blocks
        text = text.replace(/`{1,3}[^`]*`{1,3}/g, '');
        
        // Remove list markers
        text = text.replace(/^\s*[-*+]\s+/gm, '');
        text = text.replace(/^\s*\d+\.\s+/gm, '');
        
        
        
        return text;
    }
    
    // Example usage:
    if (type === 'ai') {
        text = cleanMarkdownFormatting(text);
    
        
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
            .replace(/^As Pixio AI,?/i, '')
            .replace(/^I would respond:?/i, '')
            .trim();

        loadingDiv.remove();
        addMessage(processedResponse, 'ai');

        // // Save to chat history
        // saveChat(currentChatId, Array.from(chatMessages.children).map(msg => ({
        //     type: msg.classList.contains('user-message') ? 'user' : 'ai',
        //     content: msg.querySelector('.message-content').textContent
        // })));

        // updateChatList();
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.remove();
        addMessage('I apologize, but I encountered an error. Please try asking your question again.', 'ai');
    } finally {
        isProcessing = false;
    }
}

// AI Response System
const aiResponses = {
    // Core system responses
    responses: {
        greeting: [
            "Hi there! I'm here to help.",
            "Hello! How can I assist you?",
            "Greetings! Ready to help you.",
            "Hi! Looking forward to helping you."
        ],
        
        creator: [
            "I was created by Piyush.",
            "Piyush is my creator.",
            "I'm an AI assistant developed by Piyush."
        ],
        
        identity: [
            "I'm an AI assistant designed to help with various tasks.",
            "I'm your AI helper, created to assist with different challenges.",
            "I'm an AI created to help you with tasks and questions."
        ],
        
        capabilities: [
            "I can help with coding, writing, analysis, and problem-solving.",
            "I'm capable of assisting with programming, writing, and various analytical tasks.",
            "My capabilities include helping with code, text analysis, and general problem-solving."
        ],
        
        limitations: [
            "While I'm quite capable, I can't access external websites or real-time data.",
            "I can't access the internet or process real-time information.",
            "I work with the information provided in our conversation."
        ]
    },

    // Pattern matching for questions
    patterns: {
        creator: [
            /who (created|made|built) you/i,
            /who is your (creator|maker|developer)/i,
            /who('s| is) responsible for (creating|making|developing) you/i
        ],
        identity: [
            /what are you/i,
            /who are you/i,
            /tell me about yourself/i,
            /what kind of (ai|assistant) are you/i
        ],
        capabilities: [
            /what can you do/i,
            /what are your capabilities/i,
            /how can you help/i,
            /what are you capable of/i
        ],
        limitations: [
            /what can't you do/i,
            /what are your limitations/i,
            /is there anything you can't do/i
        ]
    },

    // Get random response from category
    getRandomResponse(category) {
        const responses = this.responses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    },

    // Add friendly touch to response
    addFriendlyTouch() {
        const friendly = [
            "Thanks for asking! ",
            "I appreciate your question. ",
            "Great question! ",
            "I'm glad you asked. ",
            ""  // Empty string for occasional direct responses
        ];
        return friendly[Math.floor(Math.random() * friendly.length)];
    },

    // Process user input and return appropriate response
    processInput(userInput) {
        // Clean the input
        userInput = userInput.toLowerCase().trim();

        // Check for greetings
        if (/^(hi|hello|hey|greetings)/i.test(userInput)) {
            return this.getRandomResponse('greeting');
        }

        // Check each pattern category
        for (const [category, patternList] of Object.entries(this.patterns)) {
            for (const pattern of patternList) {
                if (pattern.test(userInput)) {
                    return this.addFriendlyTouch() + this.getRandomResponse(category);
                }
            }
        }

        // Default response if no pattern matches
        return "I understand your question. Could you please rephrase it so I can provide a better response?";
    },

    // Add custom response
    addCustomResponse(category, patterns, responses) {
        if (!this.patterns[category]) {
            this.patterns[category] = [];
            this.responses[category] = [];
        }
        
        this.patterns[category] = this.patterns[category].concat(patterns);
        this.responses[category] = this.responses[category].concat(responses);
    }
};

// Example usage:
console.log(aiResponses.processInput("Who created you?"));
console.log(aiResponses.processInput("What can you do?"));
console.log(aiResponses.processInput("Hello"));

// Example of adding custom responses
aiResponses.addCustomResponse(
    'mood',
    [/how are you/i, /how do you feel/i],
    [
        "I'm functioning well and ready to help!",
        "I'm operational and eager to assist you.",
        "I'm doing great, thanks for asking! How can I help?"
    ]
);

// Function to handle user input
function handleUserMessage(message) {
    return aiResponses.processInput(message);
}

 

 
function generateChatId() {
    return `chat_${Date.now()}`;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// function saveChat(chatId, messages) {
//     chatHistory.set(chatId, messages);
//     try {
//         localStorage.setItem('chatHistory', JSON.stringify([...chatHistory]));
//     } catch (e) {
//         console.error('Error saving chat history:', e);
//     }
// }

// function loadChatHistory() {
//     try {
//         const saved = localStorage.getItem('chatHistory');
//         if (saved) {
//             chatHistory = new Map(JSON.parse(saved));
//             updateChatList();
//         }
//     } catch (error) {
//         console.error('Error loading chat history:', error);
//         chatHistory = new Map();
//     }
// }

// function updateChatList() {
//     const chatList = document.querySelector('.chat-list');
//     if (!chatList) return;
    
//     chatList.innerHTML = '';
//     chatHistory.forEach((messages, chatId) => {
//         const chatItem = document.createElement('div');
//         chatItem.className = `chat-item ${chatId === currentChatId ? 'active' : ''}`;
//         chatItem.textContent = messages[0]?.content?.slice(0, 30) + '...' || 'New Chat';
//         chatItem.onclick = () => loadChat(chatId);
//         chatList.appendChild(chatItem);
//     });
// }

// function loadChat(chatId) {
//     currentChatId = chatId;
//     chatMessages.innerHTML = '';
//     const messages = chatHistory.get(chatId) || [];
//     messages.forEach(msg => addMessage(msg.content, msg.type));
//     updateChatList();
// }

// let chatHistory = []; // Store chat history

// // Function to create a new chat
// document.getElementById('new-chat-btn').addEventListener('click', function() {
//     const chatDisplay = document.getElementById('chat-display');
//     const chatHistorySelect = document.getElementById('chat-history-select');

//     // Simulating new chat content
//     const chatContent = `Chat started at ${new Date().toLocaleString()}`;
//     chatDisplay.innerHTML = `<p>${chatContent}</p>`;

//     // Add the new chat to the top of the history (stack)
//     chatHistory.unshift(chatContent); // Push new chat to the beginning

//     // Clear the dropdown and repopulate with updated history
//     chatHistorySelect.innerHTML = '';
//     chatHistory.forEach((chat, index) => {
//         const option = document.createElement('option');
//         option.value = index;
//         option.textContent = `Chat ${index + 1}: ${chat}`;
//         chatHistorySelect.appendChild(option);
//     });

//     // Automatically select the most recent chat
//     chatHistorySelect.selectedIndex = 0;
// });

// // Load chat history when a user selects a different chat
// document.getElementById('chat-history-select').addEventListener('change', function() {
//     const selectedIndex = this.value;
//     const chatDisplay = document.getElementById('chat-display');

//     // Display the selected chat
//     chatDisplay.innerHTML = `<p>${chatHistory[selectedIndex]}</p>`;
// });


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
    addMessage('Hello! I\'m Pixio AI. How can I help you today?', 'ai');
    updateChatList();
});

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
};

// // Initialize
// document.addEventListener('DOMContentLoaded', () => {
//     // loadChatHistory();
//     if (!chatHistory.has(currentChatId)) {
//         addMessage('Hello! I\'m Pixio AI. How can I help you today?', 'ai');
//     }
// });

 
