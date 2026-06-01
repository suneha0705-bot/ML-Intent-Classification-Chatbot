# ✦ Aura AI — Premium Interactive Intelligence Hub

Aura AI is a modern, high-performance web-based chatbot system. Designed with state-of-the-art **glassmorphism aesthetics**, interactive **neural node background visualizers**, and smooth **micro-animations**, it delivers an outstanding user experience out-of-the-box.

It runs completely client-side in the browser, making it 100% portable and easy to run locally without server overhead.

---

## 🚀 Key Features

1. **🎨 Premium Dual Dark Themes**
   - **Obsidian Dark (Default)**: Deep blue-slate, subtle glowing boundaries, and frosted glass overlays.
   - **Cyberpunk Neon**: Dynamic pink-to-cyan gradient highlights, neon drop shadows, and high-energy contrast.

2. **🧠 Multi-Persona Core Engine**
   - **Aether** (Code Architect): Rich programming outputs, structural complexity analysis, and algorithms.
   - **Lyra** (Creative Muse): Artistic narratives, copywriting frameworks, and visual analogies.
   - **Kael** (Zen Guide): Guided relaxation, breathing schedules, and emotional grounding.
   - **Sora** (Data Analyst): Quantitative comparisons, markdown data matrices, and execution checklists.

3. **🗣️ Web Voice Integration (STT & TTS)**
   - **Speech Dictation (STT)**: Press the microphone button in the input panel to dictate your thoughts.
   - **Speech Playback (TTS)**: Let Aura read out its responses. Toggle individual text-to-speech audio outputs within any message bubble.

4. **⚡ Dual-Engine Routing (Mock vs. Live API)**
   - **Simulated Mode (Default)**: Smart keyword parsing mapping prompts instantly to specialized offline markdown templates. Works completely offline.
   - **Live Cloud Mode**: Enter a Google Gemini API Key in Settings to instantly connect the chat session to Google's state-of-the-art Gemini LLM engines.

5. **📂 Conversational CRUD Sessions**
   - Save, load, rename, delete, and clear active conversations, saved securely in your browser's local cache (`localStorage`).
   - Export chats as beautifully styled text files containing timestamps and persona meta-data.

---

## 🛠️ File Structure

The project directory consists of:
```
ProjectG/
├── index.html          # Core responsive UI DOM nodes & modals
├── styles.css          # Design system, glassmorphism templates & animations
├── app.js              # State manager, Speech interfaces, Markdown compilers
├── mockResponses.js    # Rule matching and default local intelligence matrixes
└── README.md           # Professional project documentation
```

---

## 📖 How to Run Locally

Since the application utilizes native sequential script loading, you can run it **without running a web server**!

### Method 1: Double-Click (Direct Launch)
1. Navigate to the project folder `c:\Users\hp\OneDrive\Desktop\ProjectG`.
2. Double-click [index.html](file:///c:/Users/hp/OneDrive/Desktop/ProjectG/index.html) to open it in Chrome, Edge, Firefox, or Safari.

### Method 2: Development Server (Optional)
If you wish to host it on your local network:
```bash
# Using Python's built-in web server
python -m http.server 8000

# Using Node's serve utility
npx serve
```
Then navigate to `http://localhost:8000` or `http://localhost:3000` in your browser.

---

## 🔑 Activating Live LLM Engine

To connect Aura AI to live Google Gemini intelligence:
1. Click the **API Settings** gear button in the bottom left corner.
2. Visit [Google AI Studio](https://aistudio.google.com/) to obtain a free Gemini API key.
3. Paste the key into the **Gemini API Key** field, select your model variant (e.g. `Gemini 1.5 Flash`), configure your custom display name, and click **Save Configurations**.
4. The system will light up green, activating the live pipeline. All conversations from that point onward are sent directly to the Gemini model using your active persona instruction set!

---

## 🛡️ Privacy & Security
Aura AI is built on local-first principles. Your Gemini API key is stored strictly inside your browser's secure `localStorage` and is never sent to any third-party analytics platforms. Transactions are sent directly to official Google API endpoints.
