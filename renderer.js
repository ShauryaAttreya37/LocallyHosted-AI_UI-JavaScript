// sanity check
console.log('Renderer loaded');
console.log('marked available?', typeof marked);

marked.setOptions({
  breaks: true,        // line breaks work naturally
  gfm: true            // GitHub-flavored markdown
});

// State Management
let state = {
  chats: [],
  projects: [],
  currentChatId: null,
  currentModel: 'mistral',
  contextData: '',
  activeView: 'chat'
};

const elements = {
  chatsList: document.getElementById('chatsList'),
  projectsList: document.getElementById('projectsList'),
  messagesContainer: document.getElementById('messagesContainer'),
  messageInput: document.getElementById('messageInput'),
  sendBtn: document.getElementById('sendBtn'),
  newChatBtn: document.getElementById('newChatBtn'),
  modelSelect: document.getElementById('modelSelect'),
  chatTitle: document.getElementById('chatTitle'),
  messageCount: document.getElementById('messageCount'),
  loadDataBtn: document.getElementById('loadDataBtn'),
  fileInput: document.getElementById('fileInput')
};

// Initialize
async function init() {
  await loadData();
  if (state.chats.length === 0) {
    createNewChat();
  } else {
    state.currentChatId = state.chats[0].id;
  }
  setupEventListeners();
  render();
}

// Data Persistence
async function loadData() {
  const data = await window.electron.loadData();
  if (data) {
    state.chats = data.chats || [];
    state.projects = data.projects || [];
  }
}

async function saveData() {
  await window.electron.saveData({
    chats: state.chats,
    projects: state.projects
  });
}

// Chat Management
function createNewChat() {
  const newChat = {
    id: Date.now(),
    name: `Conversation ${state.chats.length + 1}`,
    messages: [],
    timestamp: Date.now(),
    model: state.currentModel
  };
  state.chats.unshift(newChat);
  state.currentChatId = newChat.id;
  saveData();
  render();
}

function deleteChat(chatId) {
  if (state.chats.length === 1) return;
  state.chats = state.chats.filter(c => c.id !== chatId);
  if (state.currentChatId === chatId) {
    state.currentChatId = state.chats[0].id;
  }
  saveData();
  render();
}

function getCurrentChat() {
  return state.chats.find(c => c.id === state.currentChatId);
}

// Ollama API Integration
async function sendToOllama(message, model) {
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: message }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama error ${response.status}: ${errText}`);
    }

    const data = await response.json();

    return data?.message?.content || '⚠️ No response from model';

  } catch (err) {
    console.error('sendToOllama error:', err);
    return `Error: ${err.message}`;
  }
}

// Message Handling
async function sendMessage() {
  const message = elements.messageInput.value.trim();
  if (!message) return;

  const currentChat = getCurrentChat();
  
  // Add user message
  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: message,
    timestamp: Date.now()
  };
  
  currentChat.messages.push(userMessage);
  elements.messageInput.value = '';
  
  // Update chat name if it's the first message
  if (currentChat.messages.length === 1) {
    currentChat.name = message.substring(0, 50) + (message.length > 50 ? '...' : '');
  }
  
  saveData();
  render();
  scrollToBottom();

  // Show typing indicator
  const typingId = Date.now() + 1;
  currentChat.messages.push({
    id: typingId,
    role: 'assistant',
    content: '🫥 Thinking....',
    timestamp: Date.now(),
    isTyping: true
  });
  render();
  scrollToBottom();

  // Get AI response
  const aiResponse = await sendToOllama(message, state.currentModel);
  
  // Remove typing indicator and add real response
  currentChat.messages = currentChat.messages.filter(m => m.id !== typingId);
  currentChat.messages.push({
    id: Date.now() + 2,
    role: 'assistant',
    content: aiResponse,
    timestamp: Date.now(),
    model: state.currentModel
  });

  currentChat.timestamp = Date.now();
  saveData();
  render();
  scrollToBottom();
}

// Rendering
function render() {
  renderChats();
  renderMessages();
  updateHeader();
}

function renderChats() {
  elements.chatsList.innerHTML = state.chats.map(chat => `
    <div class="chat-item ${chat.id === state.currentChatId ? 'active' : ''}" data-chat-id="${chat.id}">
      <div class="chat-item-content">
        <span class="chat-name">${escapeHtml(chat.name)}</span>
        <span class="chat-time">${formatTime(chat.timestamp)}</span>
      </div>
      ${state.chats.length > 1 ? `
        <button class="delete-btn" data-chat-id="${chat.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      ` : ''}
    </div>
  `).join('');

  // Add event listeners
  document.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-btn')) {
        state.currentChatId = parseInt(item.dataset.chatId);
        render();
      }
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteChat(parseInt(btn.dataset.chatId));
    });
  });
}

function renderMessages() {
  const currentChat = getCurrentChat();
  
  if (!currentChat || currentChat.messages.length === 0) {
    elements.messagesContainer.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-width="2"/>
        </svg>
        <p class="empty-text">Start a conversation</p>
        <p class="empty-subtext">Full throttle. Maximum performance.</p>
      </div>
    `;
    return;
  }

  elements.messagesContainer.innerHTML = currentChat.messages.map(msg => `
    <div class="message ${msg.role}">
      <div class="message-content ${msg.isTyping ? 'typing' : ''}">
     <div class="message-text">
     ${marked.parse(msg.content)}
    </div>


        <div class="message-meta">
          <span class="message-time">${formatTime(msg.timestamp)}</span>
          ${msg.model ? `<span class="message-model">${msg.model}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}
// Render LaTeX math after messages are inserted
if (window.MathJax) {
  MathJax.typesetPromise([elements.messagesContainer]).catch(err =>
    console.error('MathJax render error:', err)
  );
}


function updateHeader() {
  const currentChat = getCurrentChat();
  if (currentChat) {
    elements.chatTitle.textContent = currentChat.name;
    elements.messageCount.textContent = `${currentChat.messages.filter(m => !m.isTyping).length} messages`;
  }
}

function scrollToBottom() {
  setTimeout(() => {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
  }, 100);
}

// Event Listeners
function setupEventListeners() {
  elements.sendBtn.addEventListener('click', sendMessage);
  elements.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  elements.newChatBtn.addEventListener('click', createNewChat);

  elements.modelSelect.addEventListener('change', (e) => {
    state.currentModel = e.target.value;
    saveData();
  });

  elements.toggleContextBtn.addEventListener('click', () => {
    elements.contextPanel.classList.toggle('hidden');
  });

  elements.contextData.addEventListener('input', (e) => {
    state.contextData = e.target.value;
    saveData();
  });

  elements.clearContextBtn.addEventListener('click', () => {
    state.contextData = '';
    elements.contextData.value = '';
    saveData();
  });

  elements.loadDataBtn.addEventListener('click', () => {
    elements.fileInput.click();
  });

  elements.fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        state.contextData = event.target.result;
        elements.contextData.value = state.contextData;
        elements.contextPanel.classList.remove('hidden');
        saveData();
      };
      reader.readAsText(file);
    }
  });

  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeView = btn.dataset.view;
      
      if (state.activeView === 'chat') {
        elements.chatsList.classList.remove('hidden');
        elements.projectsList.classList.add('hidden');
      } else {
        elements.chatsList.classList.add('hidden');
        elements.projectsList.classList.remove('hidden');
      }
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: New chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      createNewChat();
    }
    // Ctrl/Cmd + K: Toggle context
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      elements.contextPanel.classList.toggle('hidden');
    }
  });
}

// Utility Functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString();
}

// Start the app
init();
