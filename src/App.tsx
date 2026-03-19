import { useState, useEffect } from 'react';
import { Paperclip, Wand2, Folder, Code2, RefreshCw } from 'lucide-react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [samplePrompts, setSamplePrompts] = useState<string[]>([]);

  // Larger pool of example prompts
  const allPrompts = [
    "Create a login form with email and password",
    "Add a hero section with a title and a button",
    "Make a card with an image, title and 'Learn more' link",
    "Design a pricing table with three columns",
    "Add a dark mode toggle button",
    "Create a contact form with name, email and message",
    "Build a navigation bar with dropdown menu",
    "Add a footer with social media icons",
    "Make a testimonial slider with profile pictures",
    "Create a progress bar that fills on click",
    "Add a countdown timer to an event",
    "Design a profile card with avatar and stats",
    "Insert a responsive image gallery",
    "Create a simple calculator UI",
    "Add a sticky header that changes color on scroll",
    "Make a modal popup with a close button",
    "Design a toggle switch",
    "Add a tooltip on hover",
    "Create a loading spinner animation",
    "Build a todo list with checkboxes",
  ];

  // Pick 3 random prompts
  const pickRandomPrompts = () => {
    const shuffled = [...allPrompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Initialize on mount
  useEffect(() => {
    setSamplePrompts(pickRandomPrompts());
  }, []);

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
        <div className="sidebar-footer">v0.1 · BuildWith AI</div>
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

          {/* Sample chips section */}
          <div className="samples-header">
            <span className="samples-title">Try an example:</span>
            <RefreshCw
              size={14}
              className="refresh-icon"
              onClick={() => setSamplePrompts(pickRandomPrompts())}
            />
          </div>
          <div className="samples">
            {samplePrompts.map((sample, index) => (
              <span
                key={index}
                className="sample-chip"
                onClick={() => setPrompt(sample)}
              >
                {sample.length > 30 ? sample.substring(0, 30) + '…' : sample}
              </span>
            ))}
          </div>

          <div className="helper-text">Press Enter or click Generate</div>
        </footer>
      </main>
    </div>
  );
}

export default App;