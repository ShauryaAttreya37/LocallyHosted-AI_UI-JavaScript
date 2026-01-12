# AI Assistant 🏎️🤖

A **local, offline-first desktop AI assistant** built with **Electron + Ollama**, designed for **engineering, coding, and technical reasoning**.  
Inspired by Formula 1: fast, focused, and performance-driven.

This app runs **entirely on your machine**, supports **multiple LLMs**

---

##  Features [Existing and To-Be-Added]

-  **Local LLMs (via Ollama)**
  - Mistral
  - Qwen 2.5 Coder 7B
-  **Model switching** per conversation
-  **Persistent chat history**
-  **Context injection** (project notes, files)
-  **File upload for context**
-  **LaTeX math rendering** (MathJax)
- ⌨ **Keyboard shortcuts**
-  **F1 Mercedes–inspired UI**
-  **Fully offline & private**

---

##  Tech Stack

| Layer | Technology |
|------|----------|
| Desktop Shell | Electron |
| UI | HTML, CSS, Vanilla JavaScript |
| AI Backend | Ollama |
| LLM API | Ollama `/api/chat` |
| Markdown | `marked` |
| Math Rendering | MathJax |
| Runtime | Node.js |

---


##  Prerequisites

Make sure you have the following installed:

### 1. Node.js (LTS)
Download from: https://nodejs.org  
Recommended: **Node 18 or 20**

Verify:
```bash
node -v
npm -v
````

### 2. Ollama

Download from: [https://ollama.ai](https://ollama.ai)

Verify:

```bash
ollama --version
```

---

##  Setup & Installation

### Step 1: Pull Required Models

```bash
ollama pull mistral
ollama pull qwen2.5-coder:7b
```

Verify:

```bash
ollama list
```

>  On Windows, Ollama runs automatically in the background.
> Do **not** run `ollama serve` unless you’ve disabled auto-start.

---

### Step 2: Clone / Create Project

```bash
git clone https://github.com/ShauryaAttreya37/LocallyHosted-AI_UI-JavaScript
cd f1-ai-assistant
```

Or create manually and copy files.

---

### Step 3: Install Dependencies

```bash
npm install
```

---

### Step 4: Run the App

```bash
npm start
```

The Electron window should open automatically.

---

## Project Structure

```
f1-ai-assistant/
│
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── package.json
│
├── src/
│   ├── index.html       # UI entry point
│   ├── renderer.js      # UI logic + Ollama API calls
│   └── styles.css       # Styling
│
├── knowledge/            # (Future) Project memory / RAG
│
└── README.md
```

---

##  How It Works

1. **Electron** provides the desktop shell
2. UI is rendered using **HTML/CSS/JS**
3. User messages are sent to **Ollama `/api/chat`**
4. Selected model generates a response locally
5. Responses support:

   * Markdown
   * LaTeX math (via MathJax) (Under-Maintenance)
   * Context injection (To be added)

---

##  LaTeX Math Support (AIMS)

The app supports:

* Inline math:

  ```
  $a^2 + b^2 = c^2$
  ```
* Block math:

  ```
  $$\int_{-\infty}^{\infty} e^{-x^2/2} dx = \sqrt{2\pi}$$
  ```

Math is rendered using **MathJax** after messages are injected into the DOM.

---


##  Currently Supported Models

| Model             | Use Case                        |
| ----------------- | ------------------------------- |
| Mistral           | General reasoning, explanations |
| Qwen 2.5 Coder 7B | Coding, debugging, algorithms   |

> More models can be added via Ollama without changing the app.

---

##  Troubleshooting

### AI Not Responding

* Ensure Ollama is running
* Check:

  ```bash
  ollama list
  ```

### Math Not Rendering

* Ensure MathJax is loaded in `index.html`
* Ensure CSP allows external scripts
* Restart the app after changes

### App Not Opening

* Delete `node_modules`
* Re-run:

  ```bash
  npm install
  npm start
  ```

---

##  Build Executable (Optional)

```bash
npm run build-win     # Windows
npm run build-mac     # macOS
npm run build-linux   # Linux
```

Executable will appear in the `dist/` folder.

---

##  Roadmap

* [ ] RAG (project-specific memory)
* [ ] Vision input (CV + LLM)
* [ ] Local embedding store
* [ ] Model auto-routing
* [ ] VS Code integration

---

##  Philosophy

This project is built around:

* **Performance**
* **Privacy**
* **Local-first AI**
* **Engineering clarity**

No cloud. No tracking. No fluff.

---


## 🙌 Acknowledgements

* Ollama
* Open-source LLM community
* Electron ecosystem

```

