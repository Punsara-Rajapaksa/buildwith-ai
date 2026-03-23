import { useState, useEffect, useRef } from 'react'; // helps with state and lifecycle
import { Paperclip, Wand2, Folder, Code2, RefreshCw } from 'lucide-react'; // provides react components for icons
import './App.css'; // custom css file

type GenerateResponse = {
  success?: boolean;
  code?: string | null;
  error?: string;
  details?: string | null;
};
const MAX_PROMPT_HISTORY = 24;

const getPromptSubject = (rawPrompt: string) => {
  const normalized = rawPrompt
    .trim()
    .replace(/['"]/g, '')
    .replace(/^(please\s+)?(add|create|make|build|update|change|modify)\s+/i, '')
    .replace(/\.$/, '');

  if (!normalized) {
    return 'your page';
  }

  return normalized.length > 44 ? `${normalized.slice(0, 44)}...` : normalized;
};

const buildLoadingMessages = (rawPrompt: string) => {
  const subject = getPromptSubject(rawPrompt);
  const normalizedPrompt = rawPrompt.toLowerCase();

  const genericMessages = [
    'Aligning the next update with your current page',
    'Applying your request without extra additions',
    'Preparing a focused incremental edit',
    'Merging new instruction into existing direction',
    'Checking prompt intent before rendering',
    'Composing an update that preserves prior changes',
    'Generating a clean single-pass update',
    'Polishing only the requested change set',
    'Keeping structure stable while applying updates',
    'Rendering a concise targeted revision',
    'Translating your instruction into exact UI changes',
    'Ensuring output stays scoped to your prompt',
    'Keeping the page cohesive with previous instructions',
    'Building a precise update for the preview',
    'Preparing final HTML for instant preview',
  ];

  const contentAwareMessages: string[] = [
    `Planning ${subject}`,
    `Drafting update for ${subject}`,
    `Refining ${subject} without overbuilding`,
  ];

  if (normalizedPrompt.includes('nav') || normalizedPrompt.includes('menu')) {
    contentAwareMessages.push('Laying out navigation structure with minimal footprint');
  }

  if (normalizedPrompt.includes('header')) {
    contentAwareMessages.push('Tuning header styling and preserving existing sections');
  }

  if (normalizedPrompt.includes('button')) {
    contentAwareMessages.push('Shaping button visuals and interaction states');
  }

  if (normalizedPrompt.includes('color')) {
    contentAwareMessages.push('Adjusting color values while retaining existing layout');
  }

  if (normalizedPrompt.includes('text')) {
    contentAwareMessages.push('Applying text changes with minimal structural edits');
  }

  if (normalizedPrompt.includes('footer')) {
    contentAwareMessages.push('Integrating footer update without touching unrelated regions');
  }

  if (normalizedPrompt.includes('hover')) {
    contentAwareMessages.push('Adding hover behavior and preserving baseline styles');
  }

  return [...genericMessages, ...contentAwareMessages];
};

const pickRandomLoadingMessage = (messages: string[], previousMessage: string) => {
  if (messages.length === 0) {
    return 'Preparing your update...';
  }

  if (messages.length === 1) {
    return messages[0];
  }

  let next = messages[Math.floor(Math.random() * messages.length)];

  while (next === previousMessage) {
    next = messages[Math.floor(Math.random() * messages.length)];
  }

  return next;
};

// holds what the user types and the sample prompts
function App() {
  const [prompt, setPrompt] = useState('');
  const [samplePrompts, setSamplePrompts] = useState<string[]>([]);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to generate. Type a prompt and click Generate.');
  const [statusTone, setStatusTone] = useState<'neutral' | 'success' | 'error'>('neutral');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<string[]>([]);
  const promptInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!isLoading || loadingMessages.length === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setStatusMessage((current) => pickRandomLoadingMessage(loadingMessages, current));
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, [isLoading, loadingMessages.length]);

  const handleProjectsClick = () => {
    if (isLoading) {
      return;
    }

    setStatusTone('neutral');
    setStatusMessage('Projects: coming soon.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setErrorMessage('Please enter a prompt before generating.');
      setStatusTone('error');
      setStatusMessage('Prompt is required. Add text and try again.');
      promptInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    const nextPromptHistory = [...promptHistory, trimmedPrompt].slice(-MAX_PROMPT_HISTORY);
    setPromptHistory(nextPromptHistory);
    const nextLoadingMessages = buildLoadingMessages(trimmedPrompt);
    setLoadingMessages(nextLoadingMessages);
    setStatusTone('neutral');
    setStatusMessage(pickRandomLoadingMessage(nextLoadingMessages, ''));
    setPrompt('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          promptHistory: nextPromptHistory,
        }),
      });

      let data: GenerateResponse = {};

      try {
        data = (await response.json()) as GenerateResponse;
      } catch {
        // Keep a safe fallback message when response body is not JSON.
      }

      if (!response.ok || !data.code) {
        const details = data.details ? ` (${data.details})` : '';
        const message = data.error || `Generation failed (HTTP ${response.status})`;
        throw new Error(`${message}${details}`);
      }

      setGeneratedHtml(data.code);
      setStatusTone('success');
      setStatusMessage('Preview updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setErrorMessage(message);
      setStatusTone('error');
      setStatusMessage('Generation failed. Update your prompt and try again.');
      promptInputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo" aria-label="BuildWith AI">
          <span className="logo-text">BuildWith AI</span>
        </div>
        <button type="button" className="nav-item" onClick={handleProjectsClick}>
          <Folder size={19} strokeWidth={1.65} />
          <span>Projects</span>
        </button>
        <div className="sidebar-footer">v0.1 · BuildWith AI</div>
      </aside>

      <main className="workspace">
        <div className={`preview-canvas ${isLoading ? 'is-generating' : ''}`}>
          {isLoading && <div className="preview-generating-bg" />}
          {generatedHtml ? (
            <iframe
              title="Generated webpage preview"
              className={`preview-frame ${isLoading ? 'is-generating' : ''}`}
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-scripts"
              srcDoc={generatedHtml}
            />
          ) : (
            <div className="preview-placeholder">
              <Code2 size={32} className="placeholder-icon" />
              <p>Your webpage preview will appear here...</p>
            </div>
          )}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-text">{statusMessage}</div>
            </div>
          )}
        </div>

        <footer className="input-bar">
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-wrapper">
              <Paperclip size={18} className="input-icon" />
              <input
                ref={promptInputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add a black header with a title'"
                className="prompt-input"
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="generate-button" disabled={isLoading}>
              <Wand2 size={18} />
              <span>{isLoading ? 'Generating...' : 'Generate'}</span>
            </button>
          </form>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {!isLoading && <div className={`status-message status-${statusTone}`}>{statusMessage}</div>}
          <div className="samples-row">
            <div className="samples-header">
              <span className="samples-title">Try an example:</span>
              <RefreshCw
                size={14}
                className={`refresh-icon ${isLoading ? 'is-disabled' : ''}`}
                onClick={() => {
                  if (!isLoading) {
                    setSamplePrompts(pickRandomPrompts());
                  }
                }}
              />
            </div>
            <div className="helper-text">Press Enter or click Generate</div>
          </div>
          <div className="samples">
            {samplePrompts.map((sample, index) => (
              <span
                key={index}
                className={`sample-chip ${isLoading ? 'is-disabled' : ''}`}
                onClick={() => {
                  if (!isLoading) {
                    setPrompt(sample);
                    setErrorMessage('');
                    setStatusTone('neutral');
                    setStatusMessage('Prompt ready. Click Generate.');
                  }
                }}
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