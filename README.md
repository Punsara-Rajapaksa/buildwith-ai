# BuildWith AI

**BuildWith AI** is a web application that turns natural language prompts into live, working HTML/CSS/JS code using an LLM. Type a description (e.g., “Create a red button with a hover effect”), click generate, and see the result instantly.

🚀 **Live Demo:** [https://buildwith-ai-ivory.vercel.app/]

---

## ✨ Features

- 🔮 **AI‑powered code generation** – Translates plain English into clean, self‑contained web code.
- ⚡ **Real‑time preview** – Generated code is rendered instantly inside a sandboxed iframe.
- 🎨 **Modern, responsive UI** – Sidebar layout, interactive example chips, and smooth loading states.
- 🔒 **Secure API handling** – Serverless backend proxies requests to OpenRouter, keeping API keys hidden.
- 🧠 **Smart fallback** – Automatically retries multiple LLM models for high availability.
- 📱 **Works on desktop and mobile** – Fully responsive design.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Lucide React icons, custom CSS
- **Backend:** Vercel Serverless Functions (Node.js)
- **AI Provider:** OpenRouter (with Xiaomi MiMo‑V2‑Pro model)
- **Deployment:** Vercel (frontend + API), Git version control

---
