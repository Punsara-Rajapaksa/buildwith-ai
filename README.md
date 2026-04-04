# BuildWith AI

**BuildWith AI** is a web application that turns natural language prompts into live, working HTML/CSS/JS using an LLM. Type a request (for example, "Create a red button with a hover effect"), click generate, and see the result instantly.

🚀 **Live Demo:** [https://buildwith-ai-ivory.vercel.app/](https://buildwith-ai-ivory.vercel.app/)

---

## ✨ Features

- 🔮 **AI-powered code generation** - Translates plain English into clean, self-contained web code.
- ⚡ **Real-time preview** - Generated code is rendered instantly inside a sandboxed iframe.
- 🎨 **Modern responsive UI** - Sidebar layout, interactive prompt chips, and smooth loading states.
- 🔒 **Secure API handling** - Serverless backend proxies requests to the model provider so keys stay private.
- 🧠 **Smart fallback** - Automatically retries with fallback providers/models for higher reliability.
- 📱 **Desktop + mobile friendly** - Responsive experience across screen sizes.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Lucide React, custom CSS
- **Backend:** Vercel Serverless Functions (Node.js via `@vercel/node`)
- **AI Providers:** OpenRouter (primary model configurable), Groq (fallback)
- **Deployment:** Vercel

---

## 📸 Screenshots

### Home Screen

<img width="1366" height="600" alt="image" src="https://github.com/user-attachments/assets/67ff4395-d903-4a5b-8e8b-1533a8859cf8" />

### Loading State

<img width="1366" height="680" alt="image" src="https://github.com/user-attachments/assets/b291423f-f7f6-4073-b685-af4efa773c79" />



### Generated Result Example

<img width="1366" height="678" alt="image" src="https://github.com/user-attachments/assets/54d8d11b-e857-4454-97e8-c8a3fb2c1a2b" />

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Create a `.env` file in the project root:

```bash
OPENROUTER_API_KEY="YOUR_OPENROUTER_KEY"
OPENROUTER_PRIMARY_MODEL="deepseek/deepseek-r1"
GROQ_API_KEY="YOUR_GROQ_KEY"
GROQ_FALLBACK_MODEL="llama-3.1-8b-instant"
```

### 3. Run locally

```bash
npx.cmd vercel dev --listen 3000
```

Open: [http://localhost:3000](http://localhost:3000)

> Windows tip: on PowerShell with restricted execution policy, use `npm.cmd` and `npx.cmd`.

---

## 📜 Available Scripts

```bash
npm run dev       # Frontend dev server only
npm run build     # Type-check + production build
npm run preview   # Preview production build
npm run lint      # Lint source files
```

---

## 🧭 Project Structure

```text
api/
  generate.ts
docs/
  mvp-action-plan/
  screenshots/
public/
src/
  App.tsx
  App.css
  main.tsx
```

## 🗺️ Roadmap

- Save and restore projects
- Better prompt history controls
- Prompt templates and reusable components
- Export generated code artifacts

---

## 📄 License

MIT 
