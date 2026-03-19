import { useState } from 'react';
import { Paperclip, Wand2, Folder, Code2 } from 'lucide-react'; // Import icons
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to AI
    console.log('Prompt:', prompt);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">BuildWith AI</div>
        <div className="nav-item">
          <Folder size={19} strokeWidth={1.65} />
          <span>Projects</span>
        </div>
      </aside>

      <main className="workspace">
        <div className="preview-canvas">
          <div className="preview-placeholder">
            <Code2 size={32} className="placeholder-icon" />
            <p>Your webpage preview will appear here...</p>
          </div>
        </div>

        <footer className="input-bar">
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-wrapper">
              <Paperclip size={18} className="input-icon" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add a black header with a title'"
                className="prompt-input"
              />
            </div>
            <button type="submit" className="generate-button">
              <Wand2 size={18} />
              <span>Generate</span>
            </button>
          </form>
          <div className="helper-text">Press Enter or click Generate</div>
        </footer>
      </main>
    </div>
  );
}

export default App;