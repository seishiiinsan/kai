const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const conversationsList = document.getElementById('conversationsList');
const conversationTitle = document.getElementById('conversationTitle');
const themeToggle = document.getElementById('themeToggle');

let currentConversationId = null;
let conversations = {};
let isDarkMode = false;

marked.setOptions({ breaks: true, gfm: true });

function loadTheme() {
    const savedTheme = localStorage.getItem('kai_theme');
    isDarkMode = savedTheme === 'dark';
    applyTheme();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('kai_theme', isDarkMode ? 'dark' : 'light');
    applyTheme();
}

function applyTheme() {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        themeToggle.classList.add('active');
        document.getElementById('highlight-theme').href =
            'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
    } else {
        document.documentElement.classList.remove('dark');
        themeToggle.classList.remove('active');
        document.getElementById('highlight-theme').href =
            'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
    }
}

function loadConversations() {
    const saved = localStorage.getItem('kai_conversations');
    if (saved) {
        conversations = JSON.parse(saved);
        renderConversationsList();

        const lastId = localStorage.getItem('kai_last_conversation');
        if (lastId && conversations[lastId]) {
            loadConversation(lastId);
        } else if (Object.keys(conversations).length > 0) {
            loadConversation(Object.keys(conversations)[0]);
        } else {
            createNewConversation();
        }
    } else {
        createNewConversation();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('kai_conversations', JSON.stringify(conversations));
    if (currentConversationId) {
        localStorage.setItem('kai_last_conversation', currentConversationId);
    }
}

function createNewConversation() {
    const id = 'conv_' + Date.now();
    conversations[id] = {
        id, title: 'Nouvelle conversation', messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    saveToLocalStorage();
    renderConversationsList();
    loadConversation(id);
}

function loadConversation(id) {
    currentConversationId = id;
    const conv = conversations[id];
    if (!conv) return;

    conversationTitle.textContent = conv.title;
    chatContainer.innerHTML = '';

    if (conv.messages.length === 0) {
        chatContainer.innerHTML = `
                <div class="message-fade message-container">
                    <div class="message-label text-gray-500 dark:text-gray-400">Kai</div>
                    <div class="message-content">
                        Bonjour. Comment puis-je vous aider ?
                    </div>
                </div>
            `;
    } else {
        conv.messages.forEach(msg => addMessage(msg.content, msg.role === 'user', false));
    }

    renderConversationsList();
    messageInput.focus();
    saveToLocalStorage();
}

function deleteConversation(id, event) {
    event.stopPropagation();
    if (confirm('Supprimer ?')) {
        delete conversations[id];
        saveToLocalStorage();

        if (currentConversationId === id) {
            const remainingIds = Object.keys(conversations);
            remainingIds.length > 0 ? loadConversation(remainingIds[0]) : createNewConversation();
        } else {
            renderConversationsList();
        }
    }
}

function renameConversation() {
    if (!currentConversationId) return;
    const newTitle = prompt('Titre :', conversations[currentConversationId].title);
    if (newTitle && newTitle.trim()) {
        conversations[currentConversationId].title = newTitle.trim();
        conversations[currentConversationId].updatedAt = new Date().toISOString();
        conversationTitle.textContent = newTitle.trim();
        saveToLocalStorage();
        renderConversationsList();
    }
}

function renderConversationsList() {
    const sorted = Object.values(conversations).sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    conversationsList.innerHTML = sorted.map(conv => `
                <div
                    onclick="loadConversation('${conv.id}')"
                    class="conversation-item flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
        conv.id === currentConversationId
            ? 'bg-gray-100 dark:bg-gray-900'
            : 'hover:bg-gray-50 dark:hover:bg-gray-900'
    }"
                >
                    <div class="flex-1 min-w-0">
                        <div class="text-sm text-gray-900 dark:text-gray-100 truncate">${escapeHtml(conv.title)}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">${conv.messages.length / 2} msg</div>
                    </div>
                    <button
                        onclick="deleteConversation('${conv.id}', event)"
                        class="delete-btn text-gray-400 hover:text-red-600 text-xs p-1"
                    >✕</button>
                </div>
            `).join('');
}

function parseMarkdownWithCode(text) {
    let html = marked.parse(text);
    html = html.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
        (match, lang, code) => {
            const decoded = decodeHtml(code);
            return `
                        <div class="code-block-wrapper">
                            <button class="copy-button" onclick="copyCode(this, \`${escapeForAttribute(decoded)}\`)">Copier</button>
                            <pre><code class="language-${lang}">${code}</code></pre>
                        </div>
                    `;
        }
    );
    return html;
}

function escapeForAttribute(str) {
    return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function copyCode(button, code) {
    navigator.clipboard.writeText(code).then(() => {
        button.textContent = '✓';
        setTimeout(() => button.textContent = 'Copier', 2000);
    });
}

function addMessage(content, isUser = false, saveToConv = true) {
    const div = document.createElement('div');
    div.className = 'message-fade message-container';

    if (isUser) {
        div.innerHTML = `
            <div class="message-label text-gray-500 dark:text-gray-400">Vous</div>
            <div class="message-content whitespace-pre-wrap">${escapeHtml(content)}</div>
        `;
    } else {
        const parsed = parseMarkdownWithCode(content);
        div.innerHTML = `
            <div class="message-label text-gray-500 dark:text-gray-400">Kai</div>
            <div class="message-content">${parsed}</div>
        `;
        // Applique la coloration après insertion
        setTimeout(() => {
            div.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
        }, 0);
    }

    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (saveToConv && currentConversationId) {
        conversations[currentConversationId].messages.push({
            role: isUser ? 'user' : 'assistant',
            content
        });
        conversations[currentConversationId].updatedAt = new Date().toISOString();

        if (conversations[currentConversationId].messages.length === 2 &&
            conversations[currentConversationId].title === 'Nouvelle conversation') {
            generateTitle(conversations[currentConversationId].messages[0].content);
        }

        saveToLocalStorage();
        renderConversationsList();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function generateTitle(firstMessage) {
    if (!currentConversationId) return;
    try {
        const response = await fetch('http://localhost:3000/api/generate-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: firstMessage })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const lines = decoder.decode(value).split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.done && data.title && conversations[currentConversationId]) {
                            conversations[currentConversationId].title = data.title;
                            conversationTitle.textContent = data.title;
                            saveToLocalStorage();
                            renderConversationsList();
                        }
                    } catch (e) {}
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !currentConversationId) return;

    sendBtn.disabled = true;
    messageInput.disabled = true;
    addMessage(message, true);
    messageInput.value = '';

    const responseDiv = document.createElement('div');
    responseDiv.className = 'message-fade';
    responseDiv.className = 'message-fade message-container';
    responseDiv.innerHTML = `
            <div class="message-label text-gray-500 dark:text-gray-400">Kai</div>
            <div class="message-content streaming-message"></div>
        `;
    chatContainer.appendChild(responseDiv);
    const streaming = responseDiv.querySelector('.streaming-message');

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, conversationId: currentConversationId })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const lines = decoder.decode(value).split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.error) {
                            streaming.textContent = 'Erreur : ' + data.error;
                        } else if (data.done) {
                            fullResponse = data.fullResponse;
                            streaming.innerHTML = parseMarkdownWithCode(fullResponse);
                            streaming.classList.add('done');
                            streaming.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));

                            if (currentConversationId) {
                                conversations[currentConversationId].messages.push({
                                    role: 'assistant',
                                    content: fullResponse
                                });
                                conversations[currentConversationId].updatedAt = new Date().toISOString();

                                if (conversations[currentConversationId].messages.length === 2 &&
                                    conversations[currentConversationId].title === 'Nouvelle conversation') {
                                    generateTitle(conversations[currentConversationId].messages[0].content);
                                }
                                saveToLocalStorage();
                                renderConversationsList();
                            }
                        } else if (data.content) {
                            fullResponse += data.content;
                            streaming.textContent = fullResponse;
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                        }
                    } catch (e) {}
                }
            }
        }
    } catch (error) {
        streaming.textContent = 'Erreur de connexion';
    }

    sendBtn.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

loadTheme();
loadConversations();