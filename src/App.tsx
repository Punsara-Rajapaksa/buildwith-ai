import { useState, useEffect } from 'react'; // helps with state and lifecycle
import { Paperclip, Wand2, Folder, Code2, RefreshCw } from 'lucide-react'; // provides react components for icons
import './App.css'; // custom css file

// holds what the user types and the sample prompts
function App() {
  const [prompt, setPrompt] = useState('');
  const [samplePrompts, setSamplePrompts] = useState<string[]>([]);

// Larger pool of example prompts
const allPrompts = [
  "Add a red button that says 'Click Me'",
  "Create a heading that says 'Welcome to my site'",
  "Add a paragraph with lorem ipsum text",
  "Make a simple card with a border and padding",
  "Add an image placeholder",
  "Change the background color to light blue",
  "Create a navigation bar with three links",
  "Add a footer with copyright text",
  "Make a list of three items",
  "Add a text input field with a label",
  "Create a blue box with rounded corners",
  "Add a hover effect that changes button color",
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
          <div className="samples-row">
            <div className="samples-header">
              <span className="samples-title">Try an example:</span>
              <RefreshCw
                size={14}
                className="refresh-icon"
                onClick={() => setSamplePrompts(pickRandomPrompts())}
              />
            </div>
            <div className="helper-text">Press Enter or click Generate</div>
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
        </footer>
      </main>
    </div>
  );
}

export default App;