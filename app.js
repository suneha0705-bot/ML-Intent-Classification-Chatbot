/**
 * app.js
 * Aura AI - Core Client Engine
 * Integrates state management, localStorage history, dual-mode (mock/live) response engine,
 * native Speech Web APIs, a robust custom Markdown-to-HTML parser, and active canvas particles.
 */

// ==========================================
// 1. APPLICATION STATE & CONSTANTS
// ==========================================
let currentPersona = "code_architect";
let activeSessionId = null;
let sessions = [];
let settings = {
  apiKey: "",
  model: "gemini-1.5-flash",
  username: "User",
  voiceName: "default"
};

// DOM Node Cache
const DOM = {
  appContainer: document.getElementById("app-container"),
  sidebar: document.getElementById("sidebar"),
  sidebarOpenBtn: document.getElementById("sidebar-open-btn"),
  sidebarCloseBtn: document.getElementById("sidebar-close-btn"),
  newChatBtn: document.getElementById("new-chat-btn"),
  sessionList: document.getElementById("session-list-root"),
  themeToggleBtn: document.getElementById("theme-toggle-btn"),
  themeBtnIcon: document.getElementById("theme-btn-icon"),
  themeBtnText: document.getElementById("theme-btn-text"),
  settingsOpenBtn: document.getElementById("settings-open-btn"),
  
  headerPersonaIcon: document.getElementById("header-persona-icon"),
  headerPersonaName: document.getElementById("header-persona-name"),
  headerPersonaStatus: document.getElementById("header-persona-status"),
  exportChatBtn: document.getElementById("export-chat-btn"),
  clearChatBtn: document.getElementById("clear-chat-btn"),
  personaSwitcher: document.getElementById("persona-switcher"),
  
  chatFeed: document.getElementById("chat-feed"),
  welcomeScreen: document.getElementById("welcome-screen"),
  
  speechMicBtn: document.getElementById("speech-mic-btn"),
  chatInput: document.getElementById("chat-input"),
  chatSendBtn: document.getElementById("chat-send-btn"),
  
  // Settings Modal Nodes
  settingsModal: document.getElementById("settings-modal"),
  settingsApiKey: document.getElementById("settings-api-key"),
  settingsModel: document.getElementById("settings-model"),
  settingsUsername: document.getElementById("settings-username"),
  settingsVoice: document.getElementById("settings-tts-voice"),
  settingsCancelBtn: document.getElementById("settings-cancel-btn"),
  settingsSaveBtn: document.getElementById("settings-save-btn"),
  settingsCloseBtn: document.getElementById("settings-close-btn")
};

// ==========================================
// 2. PARTICLE VISUALIZER CANVAS
// ==========================================
const ParticleBg = {
  canvas: document.getElementById("particle-canvas"),
  ctx: null,
  particles: [],
  maxParticles: 60,
  connectionDist: 110,
  mouse: { x: null, y: null, radius: 150 },
  
  init() {
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    
    // Track mouse
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener("mouseleave", () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
    
    // Create particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1
      });
    }
    
    this.animate();
  },
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get colors from CSS vars
    const isCyberpunk = DOM.appContainer.classList.contains("theme-cyberpunk");
    const particleColor = isCyberpunk ? "rgba(236, 72, 153, 0.25)" : "rgba(99, 102, 241, 0.15)";
    const lineColor = isCyberpunk ? "rgba(6, 182, 212, 0.08)" : "rgba(255, 255, 255, 0.035)";
    
    // Draw connections and move particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      
      // Boundaries
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      
      // Draw node
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = particleColor;
      this.ctx.fill();
      
      // Interact with mouse
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          // Attract lightly
          p.x -= dx * 0.01;
          p.y -= dy * 0.01;
        }
      }
      
      // Lines between nodes
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.connectionDist) {
          const alpha = (1 - distance / this.connectionDist) * 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = lineColor.replace(/[^,]+(?=\))/, alpha);
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(() => this.animate());
  }
};

// ==========================================
// 3. SPEECH WEB API WRAPPERS
// ==========================================
const SpeechSystem = {
  recognition: null,
  isRecording: false,
  synthesis: window.speechSynthesis,
  activeUtterance: null,
  activeSpeakBtn: null,
  voices: [],
  
  init() {
    // 1. Setup speech recognition (STT)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";
      
      this.recognition.onstart = () => {
        this.isRecording = true;
        DOM.speechMicBtn.classList.add("recording");
        DOM.speechMicBtn.innerHTML = "🔴";
        DOM.chatInput.placeholder = "Listening...";
      };
      
      this.recognition.onend = () => {
        this.isRecording = false;
        DOM.speechMicBtn.classList.remove("recording");
        DOM.speechMicBtn.innerHTML = "🎤";
        DOM.chatInput.placeholder = "Ask Aura anything...";
      };
      
      this.recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        DOM.chatInput.value += (DOM.chatInput.value ? " " : "") + text;
        DOM.chatInput.dispatchEvent(new Event("input"));
        DOM.chatInput.focus();
      };
      
      this.recognition.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        this.recognition.stop();
      };
    } else {
      DOM.speechMicBtn.style.display = "none";
      console.warn("Speech Recognition not supported in this browser.");
    }
    
    // 2. Setup speech synthesis (TTS)
    if (this.synthesis) {
      const loadVoices = () => {
        this.voices = this.synthesis.getVoices();
        // Populate modal select
        DOM.settingsVoice.innerHTML = `<option value="default">Default Browser TTS Voice</option>`;
        this.voices.forEach(voice => {
          const option = document.createElement("option");
          option.value = voice.name;
          option.textContent = `${voice.name} (${voice.lang})`;
          if (settings.voiceName === voice.name) {
            option.selected = true;
          }
          DOM.settingsVoice.appendChild(option);
        });
      };
      loadVoices();
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = loadVoices;
      }
    }
  },
  
  toggleRecording() {
    if (!this.recognition) return;
    if (this.isRecording) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  },
  
  stopSpeaking() {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    if (this.activeSpeakBtn) {
      this.activeSpeakBtn.classList.remove("active");
      this.activeSpeakBtn.innerHTML = "🔊 Speak";
      this.activeSpeakBtn = null;
    }
    this.activeUtterance = null;
  },
  
  speakText(text, btnElement) {
    if (!this.synthesis) return;
    
    // If clicking the currently speaking message, stop it
    if (this.activeSpeakBtn === btnElement && this.synthesis.speaking) {
      this.stopSpeaking();
      return;
    }
    
    // Stop any existing playback
    this.stopSpeaking();
    
    // Clean text of markdown blocks before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "[code snippet omitted]")
      .replace(/[*#`|_\-]/g, "")
      .trim();
      
    if (!cleanText) return;
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set custom selected voice
    if (settings.voiceName !== "default") {
      const selected = this.voices.find(v => v.name === settings.voiceName);
      if (selected) utterance.voice = selected;
    }
    
    utterance.onend = () => {
      this.stopSpeaking();
    };
    
    utterance.onerror = () => {
      this.stopSpeaking();
    };
    
    this.activeUtterance = utterance;
    this.activeSpeakBtn = btnElement;
    
    btnElement.classList.add("active");
    btnElement.innerHTML = "🛑 Stop";
    
    this.synthesis.speak(utterance);
  }
};

// ==========================================
// 4. ROBUST CUSTOM MARKDOWN PARSER
// ==========================================
const MarkdownParser = {
  render(text) {
    if (!text) return "";
    
    const lines = text.split("\n");
    let html = [];
    let inCode = false;
    let codeContent = [];
    let codeLang = "javascript";
    let inTable = false;
    let tableRows = [];
    let inList = false;
    let listType = null; // 'ul' or 'ol'
    
    const closeList = () => {
      if (inList) {
        html.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
    };
    
    const closeTable = () => {
      if (inTable) {
        html.push(this.compileTable(tableRows));
        tableRows = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let trimmed = line.trim();
      
      // 1. Code Blocks Scanner
      if (trimmed.startsWith("```")) {
        closeList();
        closeTable();
        
        if (inCode) {
          // Close Code Block
          html.push(this.compileCodeBlock(codeContent.join("\n"), codeLang));
          codeContent = [];
          inCode = false;
        } else {
          // Open Code Block
          inCode = true;
          codeLang = trimmed.substring(3).trim() || "javascript";
        }
        continue;
      }
      
      if (inCode) {
        codeContent.push(line);
        continue;
      }
      
      // 2. Table Scanner
      if (trimmed.startsWith("|")) {
        closeList();
        inTable = true;
        tableRows.push(trimmed);
        continue;
      } else if (inTable && !trimmed.startsWith("|")) {
        closeTable();
      }
      
      // 3. Header formatting
      if (trimmed.startsWith("#")) {
        closeList();
        let level = 0;
        while (trimmed.startsWith("#")) {
          level++;
          trimmed = trimmed.substring(1);
        }
        trimmed = trimmed.trim();
        html.push(`<h${level}>${this.parseInline(trimmed)}</h${level}>`);
        continue;
      }
      
      // 4. Bullet & Numbered lists formatting
      const ulMatch = trimmed.match(/^[\*\-\+]\s+(.*)/);
      const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      
      if (ulMatch) {
        if (!inList || listType !== "ul") {
          closeList();
          html.push("<ul>");
          inList = true;
          listType = "ul";
        }
        html.push(`<li>${this.parseInline(ulMatch[1])}</li>`);
        continue;
      } else if (olMatch) {
        if (!inList || listType !== "ol") {
          closeList();
          html.push("<ol>");
          inList = true;
          listType = "ol";
        }
        html.push(`<li>${this.parseInline(olMatch[2])}</li>`);
        continue;
      } else if (inList && trimmed === "") {
        closeList();
      }
      
      // Empty Lines
      if (trimmed === "") {
        continue;
      }
      
      // 5. Standard Paragraph fallback
      html.push(`<p>${this.parseInline(line)}</p>`);
    }
    
    // Close remaining contexts
    closeList();
    closeTable();
    
    return html.join("\n");
  },
  
  parseInline(text) {
    if (!text) return "";
    
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    // Bold: **text**
    html = html.replace(/\*\*([\s\S]*?)\*\*/g, "<strong>$1</strong>");
    
    // Italic: *text*
    html = html.replace(/\*([\s\S]*?)\*/g, "<em>$1</em>");
    
    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    
    return html;
  },
  
  compileCodeBlock(code, lang) {
    const id = "code_" + Math.random().toString(36).substring(2, 9);
    // Escape code
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    return `
      <div class="code-block-container" id="${id}">
        <div class="code-block-header">
          <span class="code-block-lang">${lang}</span>
          <button class="code-block-copy-btn" onclick="MarkdownParser.copyCode('${id}')">Copy Code</button>
        </div>
        <pre><code class="language-${lang}">${escaped}</code></pre>
      </div>
    `;
  },
  
  compileTable(rows) {
    if (rows.length === 0) return "";
    
    let html = ["<table>"];
    let headerParsed = false;
    
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      // Split cols and strip empty slots
      const cols = row.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      // Skip dividers: | :--- | :--- |
      if (row.match(/^\|\s*:?-+:?\s*\|/)) continue;
      
      if (!headerParsed) {
        html.push("<thead><tr>");
        cols.forEach(c => html.push(`<th>${this.parseInline(c)}</th>`));
        html.push("</tr></thead><tbody>");
        headerParsed = true;
      } else {
        html.push("<tr>");
        cols.forEach(c => html.push(`<td>${this.parseInline(c)}</td>`));
        html.push("</tr>");
      }
    }
    
    if (headerParsed) html.push("</tbody>");
    html.push("</table>");
    return html.join("\n");
  },
  
  copyCode(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const code = container.querySelector("pre code").textContent;
    const btn = container.querySelector(".code-block-copy-btn");
    
    navigator.clipboard.writeText(code).then(() => {
      const originalText = btn.textContent;
      btn.textContent = "Copied! ✓";
      btn.style.color = "var(--success)";
      btn.style.borderColor = "var(--success)";
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 2000);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  }
};
// Attach copy helper globally to let HTML calls reach it
window.MarkdownParser = MarkdownParser;

// ==========================================
// 5. SESSION & HISTORY CRUD STATE MANAGEMENT
// ==========================================
const ChatSessions = {
  load() {
    // Load sessions
    const storedSessions = localStorage.getItem("aura_sessions");
    if (storedSessions) {
      try {
        sessions = JSON.parse(storedSessions);
      } catch (e) {
        console.error("Error parsing stored sessions", e);
        sessions = [];
      }
    }
    
    // Load activeSessionId
    const storedActiveId = localStorage.getItem("aura_active_session");
    if (storedActiveId && sessions.find(s => s.id === storedActiveId)) {
      activeSessionId = storedActiveId;
    } else if (sessions.length > 0) {
      activeSessionId = sessions[0].id;
    } else {
      activeSessionId = null;
    }
    
    this.renderList();
  },
  
  save() {
    localStorage.setItem("aura_sessions", JSON.stringify(sessions));
    if (activeSessionId) {
      localStorage.setItem("aura_active_session", activeSessionId);
    } else {
      localStorage.removeItem("aura_active_session");
    }
  },
  
  create(persona = currentPersona) {
    const pInfo = MockResponses[persona] || { name: "Aura", avatar: "✦" };
    const newSession = {
      id: "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      name: `${pInfo.name} Session`,
      persona: persona,
      timestamp: Date.now(),
      messages: []
    };
    
    sessions.unshift(newSession);
    activeSessionId = newSession.id;
    this.save();
    this.renderList();
    this.loadSession(newSession.id);
  },
  
  delete(id, event) {
    if (event) event.stopPropagation();
    
    const idx = sessions.findIndex(s => s.id === id);
    if (idx === -1) return;
    
    sessions.splice(idx, 1);
    
    if (activeSessionId === id) {
      activeSessionId = sessions.length > 0 ? sessions[0].id : null;
    }
    
    this.save();
    this.renderList();
    
    if (activeSessionId) {
      this.loadSession(activeSessionId);
    } else {
      UI.showWelcome();
    }
  },
  
  rename(id, event) {
    if (event) event.stopPropagation();
    
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    
    const newName = prompt("Rename this conversation:", session.name);
    if (newName && newName.trim()) {
      session.name = newName.trim();
      this.save();
      this.renderList();
    }
  },
  
  loadSession(id) {
    SpeechSystem.stopSpeaking();
    activeSessionId = id;
    localStorage.setItem("aura_active_session", id);
    
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    
    currentPersona = session.persona;
    UI.updatePersonaSwitchUI(currentPersona);
    
    this.renderList(); // Reflect new active state
    UI.renderFeed(session.messages);
    
    // Close sidebar on mobile
    if (window.innerWidth <= 900) {
      DOM.sidebar.classList.remove("active");
    }
  },
  
  renderList() {
    DOM.sessionList.innerHTML = "";
    
    if (sessions.length === 0) {
      DOM.sessionList.innerHTML = `
        <div style="padding: 20px; font-size: 0.82rem; text-align: center; color: var(--text-muted);">
          No conversations found.<br>Create one to start!
        </div>
      `;
      return;
    }
    
    sessions.forEach(session => {
      const pInfo = MockResponses[session.persona] || { name: "Aura", avatar: "✦" };
      const isActive = session.id === activeSessionId;
      
      const item = document.createElement("div");
      item.className = `chat-session-item ${isActive ? "active" : ""}`;
      item.onclick = () => this.loadSession(session.id);
      
      item.innerHTML = `
        <div class="chat-session-info">
          <span class="chat-session-icon">${pInfo.avatar}</span>
          <span class="chat-session-name" title="${session.name}">${session.name}</span>
        </div>
        <div class="session-actions">
          <button class="session-btn edit-btn" onclick="ChatSessions.rename('${session.id}', event)" title="Rename chat">✏️</button>
          <button class="session-btn delete-btn" onclick="ChatSessions.delete('${session.id}', event)" title="Delete chat">🗑️</button>
        </div>
      `;
      
      DOM.sessionList.appendChild(item);
    });
  }
};
// Expose sessions globally to allow inline buttons to trigger them
window.ChatSessions = ChatSessions;

// ==========================================
// 6. RESPONSE DISPATCH ENGINE (MOCK VS API)
// ==========================================
const ResponseEngine = {
  // offline local matching
  getMockResponse(persona, prompt) {
    const pData = MockResponses[persona];
    if (!pData) return "Error: Unknown persona configured.";
    
    const query = prompt.toLowerCase();
    
    // Scan keywords
    for (let i = 0; i < pData.keywords.length; i++) {
      const kBlock = pData.keywords[i];
      const match = kBlock.keys.some(k => query.includes(k));
      if (match) {
        return kBlock.response;
      }
    }
    
    return pData.default;
  },
  
  // Real live streaming Gemini API Fetcher
  async getGeminiAPIResponse(persona, fullConversation, onChunk) {
    const key = settings.apiKey;
    const model = settings.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    
    const pData = MockResponses[persona];
    const systemInstruction = `You are a chatbot assistant named ${pData.name}, with the persona profile of a "${pData.title}". Always speak and formulate answers matching this profile. Style your answers beautifully with highly advanced markdown headings, lists, tables, and Javascript/Python code containers when applicable.`;
    
    // Map full history to Gemini schema
    // Roles: 'user', 'model'
    const contents = fullConversation.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));
    
    const payload = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    };
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!answer) {
        throw new Error("Empty candidate response returned by Gemini engine.");
      }
      
      // Simulate beautiful real-time streaming using typewriter loops
      await this.typewriterStream(answer, onChunk);
      
    } catch (e) {
      console.error("Gemini API crash details:", e);
      throw e;
    }
  },
  
  typewriterStream(fullText, onChunk) {
    return new Promise(resolve => {
      let currentIdx = 0;
      const charsPerTick = 4; // Types out 4 chars per 15ms frame for rapid fluid response
      const interval = setInterval(() => {
        currentIdx += charsPerTick;
        if (currentIdx >= fullText.length) {
          clearInterval(interval);
          onChunk(fullText);
          resolve();
        } else {
          onChunk(fullText.substring(0, currentIdx));
        }
      }, 15);
    });
  }
};

// ==========================================
// 7. USER INTERFACE (UI) DOM ENGINE
// ==========================================
const UI = {
  init() {
    this.loadSettings();
    this.initEventListeners();
    this.updateThemeUI();
    
    // Select default active persona Display
    this.updatePersonaSwitchUI(currentPersona);
  },
  
  loadSettings() {
    const saved = localStorage.getItem("aura_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        settings = { ...settings, ...parsed };
      } catch(e) {
        console.error("Error parsing settings", e);
      }
    }
    
    // Apply modal settings values
    DOM.settingsApiKey.value = settings.apiKey;
    DOM.settingsModel.value = settings.model;
    DOM.settingsUsername.value = settings.username;
    
    this.updateDisclaimer();
  },
  
  updateDisclaimer() {
    const disc = document.querySelector(".input-disclaimer");
    if (settings.apiKey) {
      disc.innerHTML = `🟢 Powered by Gemini API (Model: <strong>${settings.model}</strong>) • Running Live`;
      disc.style.color = "var(--success)";
    } else {
      disc.innerHTML = `Runs offline in simulated mode. Enter a Gemini API Key in the Settings to unlock the live model.`;
      disc.style.color = "";
    }
  },
  
  initEventListeners() {
    // Sidebar toggle (Mobile/Responsive)
    DOM.sidebarOpenBtn.addEventListener("click", () => DOM.sidebar.classList.add("active"));
    DOM.sidebarCloseBtn.addEventListener("click", () => DOM.sidebar.classList.remove("active"));
    
    // New conversation trigger
    DOM.newChatBtn.addEventListener("click", () => ChatSessions.create());
    
    // Inputs resizing and enabling send
    DOM.chatInput.addEventListener("input", (e) => {
      // Auto-grow textarea
      DOM.chatInput.style.height = "auto";
      DOM.chatInput.style.height = DOM.chatInput.scrollHeight + "px";
      
      const hasVal = DOM.chatInput.value.trim().length > 0;
      DOM.chatSendBtn.disabled = !hasVal;
    });
    
    // Submit prompt actions
    DOM.chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.submitPrompt();
      }
    });
    DOM.chatSendBtn.addEventListener("click", () => this.submitPrompt());
    
    // Switch personas tabs
    // Standard event delegation handles persona tab switches below
    DOM.personaSwitcher.addEventListener("click", (e) => {
      const tab = e.target.closest(".persona-tab");
      if (!tab) return;
      
      const persona = tab.dataset.persona;
      if (persona === currentPersona) return;
      
      // If we have an active chat session, change its persona routing
      if (activeSessionId) {
        const session = sessions.find(s => s.id === activeSessionId);
        if (session) {
          session.persona = persona;
          ChatSessions.save();
          ChatSessions.loadSession(activeSessionId);
        }
      } else {
        // Create new session with this persona
        ChatSessions.create(persona);
      }
    });
    
    // Mic recording STT trigger
    DOM.speechMicBtn.addEventListener("click", () => SpeechSystem.toggleRecording());
    
    // Settings overlays
    DOM.settingsOpenBtn.addEventListener("click", () => DOM.settingsModal.classList.add("active"));
    DOM.settingsCloseBtn.addEventListener("click", () => DOM.settingsModal.classList.remove("active"));
    DOM.settingsCancelBtn.addEventListener("click", () => DOM.settingsModal.classList.remove("active"));
    DOM.settingsSaveBtn.addEventListener("click", () => this.saveSettings());
    
    // Close modal clicking outside
    DOM.settingsModal.addEventListener("click", (e) => {
      if (e.target === DOM.settingsModal) DOM.settingsModal.classList.remove("active");
    });
    
    // Top headers action widgets
    DOM.clearChatBtn.addEventListener("click", () => {
      if (activeSessionId) {
        const session = sessions.find(s => s.id === activeSessionId);
        if (session) {
          session.messages = [];
          ChatSessions.save();
          this.renderFeed([]);
        }
      }
    });
    
    DOM.exportChatBtn.addEventListener("click", () => this.exportCurrentChat());
    
    // Theme toggle button
    DOM.themeToggleBtn.addEventListener("click", () => {
      DOM.appContainer.classList.toggle("theme-cyberpunk");
      this.updateThemeUI();
      // Save theme
      const isCyberpunk = DOM.appContainer.classList.contains("theme-cyberpunk");
      localStorage.setItem("aura_theme_cyberpunk", isCyberpunk ? "true" : "false");
    });
    
    // Load initial theme from cache
    const isCyberpunkSaved = localStorage.getItem("aura_theme_cyberpunk") === "true";
    if (isCyberpunkSaved) {
      DOM.appContainer.classList.add("theme-cyberpunk");
      this.updateThemeUI();
    }
    
    // Template cards quick start click bindings
    DOM.chatFeed.addEventListener("click", (e) => {
      const card = e.target.closest(".template-card");
      if (!card) return;
      
      const prompt = card.dataset.prompt;
      DOM.chatInput.value = prompt;
      DOM.chatInput.dispatchEvent(new Event("input"));
      this.submitPrompt();
    });
  },
  
  updateThemeUI() {
    const isCyberpunk = DOM.appContainer.classList.contains("theme-cyberpunk");
    if (isCyberpunk) {
      DOM.themeBtnIcon.innerHTML = "🌌";
      DOM.themeBtnText.innerHTML = "Obsidian Theme";
    } else {
      DOM.themeBtnIcon.innerHTML = "💡";
      DOM.themeBtnText.innerHTML = "Cyberpunk Theme";
    }
  },
  
  updatePersonaSwitchUI(persona) {
    currentPersona = persona;
    const tabs = DOM.personaSwitcher.querySelectorAll(".persona-tab");
    tabs.forEach(tab => {
      if (tab.dataset.persona === persona) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
    
    // Update Header Active display
    const pInfo = MockResponses[persona];
    if (pInfo) {
      DOM.headerPersonaIcon.textContent = pInfo.avatar;
      DOM.headerPersonaName.textContent = pInfo.name;
      DOM.headerPersonaStatus.textContent = `${pInfo.title} • Online`;
    }
  },
  
  saveSettings() {
    settings.apiKey = DOM.settingsApiKey.value.trim();
    settings.model = DOM.settingsModel.value;
    settings.username = DOM.settingsUsername.value.trim() || "User";
    settings.voiceName = DOM.settingsVoice.value;
    
    localStorage.setItem("aura_settings", JSON.stringify(settings));
    
    this.updateDisclaimer();
    DOM.settingsModal.classList.remove("active");
    
    // Reload feed user bubbles to capture updated Username if applicable
    if (activeSessionId) {
      const session = sessions.find(s => s.id === activeSessionId);
      if (session) this.renderFeed(session.messages);
    }
  },
  
  showWelcome() {
    DOM.welcomeScreen.style.display = "flex";
    DOM.clearChatBtn.style.display = "none";
    DOM.exportChatBtn.style.display = "none";
    
    // Clear feed nodes excluding welcome screen
    const messages = DOM.chatFeed.querySelectorAll(".message-wrapper");
    messages.forEach(m => m.remove());
  },
  
  renderFeed(messages) {
    // Clear feed excluding welcome screen
    const existingBubbles = DOM.chatFeed.querySelectorAll(".message-wrapper");
    existingBubbles.forEach(m => m.remove());
    
    if (messages.length === 0) {
      this.showWelcome();
      return;
    }
    
    DOM.welcomeScreen.style.display = "none";
    DOM.clearChatBtn.style.display = "block";
    DOM.exportChatBtn.style.display = "block";
    
    messages.forEach(msg => {
      this.appendMessageBubble(msg.role, msg.content, msg.id);
    });
    
    this.scrollToBottom();
  },
  
  scrollToBottom() {
    DOM.chatFeed.scrollTop = DOM.chatFeed.scrollHeight;
  },
  
  appendMessageBubble(role, content, id) {
    const isUser = role === "user";
    const wrapper = document.createElement("div");
    wrapper.className = `message-wrapper ${role}`;
    wrapper.id = id;
    
    const pData = MockResponses[currentPersona];
    const avatar = isUser ? "👤" : pData.avatar;
    const name = isUser ? settings.username : pData.name;
    
    const bubbleHTML = MarkdownParser.render(content);
    
    wrapper.innerHTML = `
      <div class="message-avatar" title="${name}">${avatar}</div>
      <div class="message-body-container">
        <div class="message-bubble">${bubbleHTML}</div>
        ${!isUser ? `
          <div class="message-actions-bar">
            <button class="msg-action-btn speak-btn" onclick="UI.handleSpeakClick('${id}')">🔊 Speak</button>
            <button class="msg-action-btn" onclick="UI.handleCopyTextClick('${id}')">📋 Copy</button>
          </div>
        ` : ""}
      </div>
    `;
    
    DOM.chatFeed.appendChild(wrapper);
    this.scrollToBottom();
  },
  
  handleSpeakClick(messageId) {
    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;
    
    const msg = session.messages.find(m => m.id === messageId);
    if (!msg) return;
    
    const wrapper = document.getElementById(messageId);
    const btn = wrapper.querySelector(".speak-btn");
    
    SpeechSystem.speakText(msg.content, btn);
  },
  
  handleCopyTextClick(messageId) {
    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;
    
    const msg = session.messages.find(m => m.id === messageId);
    if (!msg) return;
    
    navigator.clipboard.writeText(msg.content).then(() => {
      const btn = document.getElementById(messageId).querySelector(".msg-action-btn:nth-child(2)");
      const orig = btn.textContent;
      btn.textContent = "Copied! ✓";
      btn.style.color = "var(--success)";
      
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.color = "";
      }, 2000);
    });
  },
  
  showTypingBubble() {
    const wrapper = document.createElement("div");
    wrapper.className = "message-wrapper assistant typing-indicator-wrapper";
    wrapper.id = "typing-status-bubble";
    
    const pData = MockResponses[currentPersona];
    
    wrapper.innerHTML = `
      <div class="message-avatar">${pData.avatar}</div>
      <div class="message-body-container">
        <div class="message-bubble" style="padding: 12px 18px;">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    DOM.chatFeed.appendChild(wrapper);
    this.scrollToBottom();
  },
  
  removeTypingBubble() {
    const bubble = document.getElementById("typing-status-bubble");
    if (bubble) bubble.remove();
  },
  
  async submitPrompt() {
    const input = DOM.chatInput.value.trim();
    if (!input) return;
    
    // Stop voice if user interacts
    SpeechSystem.stopSpeaking();
    
    // Ensure we have an active chat session
    if (!activeSessionId) {
      ChatSessions.create();
    }
    
    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;
    
    // Clear Input DOM
    DOM.chatInput.value = "";
    DOM.chatInput.style.height = "44px";
    DOM.chatSendBtn.disabled = true;
    
    // Append User Prompt
    const userMsgId = "msg_user_" + Date.now();
    const userMsg = {
      id: userMsgId,
      role: "user",
      content: input,
      timestamp: Date.now()
    };
    
    session.messages.push(userMsg);
    ChatSessions.save();
    
    // Render immediately
    DOM.welcomeScreen.style.display = "none";
    DOM.clearChatBtn.style.display = "block";
    DOM.exportChatBtn.style.display = "block";
    this.appendMessageBubble("user", input, userMsgId);
    
    // Show AI status thinking indicator
    this.showTypingBubble();
    
    // Generate AI response
    const aiMsgId = "msg_assistant_" + Date.now();
    const aiMsg = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      timestamp: Date.now()
    };
    
    try {
      if (settings.apiKey) {
        // Real model mode
        session.messages.push(aiMsg);
        this.removeTypingBubble();
        this.appendMessageBubble("assistant", "", aiMsgId);
        
        const bubble = document.getElementById(aiMsgId).querySelector(".message-bubble");
        
        await ResponseEngine.getGeminiAPIResponse(
          session.persona,
          session.messages.slice(0, -1), // feed all conversation history prior to this empty response
          (streamedText) => {
            aiMsg.content = streamedText;
            bubble.innerHTML = MarkdownParser.render(streamedText);
            this.scrollToBottom();
          }
        );
        ChatSessions.save();
      } else {
        // Local simulation typewriter simulator
        const reply = ResponseEngine.getMockResponse(session.persona, input);
        
        // Wait briefly for a simulated intelligence "thinking" lag (e.g. 500ms)
        await new Promise(resolve => setTimeout(resolve, 550));
        
        this.removeTypingBubble();
        session.messages.push(aiMsg);
        this.appendMessageBubble("assistant", "", aiMsgId);
        
        const bubble = document.getElementById(aiMsgId).querySelector(".message-bubble");
        
        await ResponseEngine.typewriterStream(reply, (streamedText) => {
          aiMsg.content = streamedText;
          bubble.innerHTML = MarkdownParser.render(streamedText);
          this.scrollToBottom();
        });
        
        ChatSessions.save();
      }
    } catch (e) {
      console.error(e);
      this.removeTypingBubble();
      
      const errorMsg = `⚠️ **Engine Connection Aborted**\n\nFailed to establish standard connection pipeline. \n\n*Error details: ${e.message}* \n\nPlease verify that your Gemini API key in Settings is valid, and check your internet connection.`;
      
      // Update bubble content
      const bubble = document.getElementById(aiMsgId)?.querySelector(".message-bubble");
      if (bubble) {
        aiMsg.content = errorMsg;
        bubble.innerHTML = MarkdownParser.render(errorMsg);
      } else {
        // Fallback bubble insert
        aiMsg.content = errorMsg;
        this.appendMessageBubble("assistant", errorMsg, aiMsgId);
      }
      ChatSessions.save();
    }
  },
  
  exportCurrentChat() {
    const session = sessions.find(s => s.id === activeSessionId);
    if (!session || session.messages.length === 0) return;
    
    // Format messages as beautiful text file
    let text = `========================================================\n`;
    text += `   Aura AI Chat Export - Session: ${session.name}\n`;
    text += `   Persona: ${session.persona} • Generated on ${new Date().toLocaleString()}\n`;
    text += `========================================================\n\n`;
    
    session.messages.forEach(m => {
      const roleName = m.role === "user" ? settings.username : `Aura [${session.persona}]`;
      text += `[${new Date(m.timestamp).toLocaleTimeString()}] ${roleName}:\n`;
      text += `${m.content}\n`;
      text += `--------------------------------------------------------\n\n`;
    });
    
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `Aura_Chat_Export_${session.name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }
};
window.UI = UI;

// ==========================================
// 8. SYSTEM INITIALIZER ENTRY POINT
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  ParticleBg.init();
  SpeechSystem.init();
  UI.init();
  
  // Load conversation cache and restore active sessions
  ChatSessions.load();
});
