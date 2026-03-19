// api/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'; // types for request and response objects in Vercel serverless functions

// This is the API route handler for generating code based on user prompts.
export default async function handler(
  req: VercelRequest, // incoming request object containing method, body, etc.
  res: VercelResponse // outgoing response object used to send back status and data
) {

  // Only allow POST requests because we're sending a prompt
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body; // extract the prompt from the request body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // The OpenRouter API key (will be loaded from environment variable)
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Call OpenRouter's chat completions endpoint
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        // identify the app
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:5173',
        'X-Title': 'BuildWith AI',
      },
      body: JSON.stringify({
        // We'll use the free model "openrouter/hunter-alpha" for now
        model: 'openrouter/hunter-alpha',
        messages: [
          {
            role: 'system',
            content: `You are an expert web developer. The user will describe a webpage or changes to make to an existing webpage. 
            You MUST respond with ONLY a complete, valid HTML document — no explanations, no markdown, no code fences. 
            The HTML should be modern, beautiful, and fully self-contained with inline CSS and JS. 
            If there is existing HTML provided, modify it according to the user's request while preserving existing content unless told otherwise. 
            The code should be self-contained and ready to render in a browser.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      // Try to get error details
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      return res.status(response.status).json({ error: 'OpenRouter request failed', details: errorText });
    }

    const data = await response.json();
    const generatedCode = data.choices[0]?.message?.content || '';

    // Clean up any accidental markdown 
    const cleanedCode = generatedCode
      .replace(/```html/g, '')
      .replace(/```css/g, '')
      .replace(/```javascript/g, '')
      .replace(/```js/g, '')
      .replace(/```/g, '')
      .trim();

    return res.status(200).json({ code: cleanedCode, success: true });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}