// api/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'; // types for request and response objects in Vercel serverless functions

type GenerateSuccessResponse = {
  success: true;
  code: string;
  modelUsed: string;
  attemptedModels: string[];
  error: null;
  details: null;
};

type GenerateErrorResponse = {
  success: false;
  code: null;
  modelUsed: string | null;
  attemptedModels: string[];
  error: string;
  details: string | null;
};

type OpenRouterErrorPayload = {
  error?: {
    message?: string;
  };
  message?: string;
};

type ModelAttemptResult = {
  ok: boolean;
  status: number;
  code: string;
  details: string;
};

const SYSTEM_PROMPT = `You are an expert web developer. The user will describe a webpage or changes to make to an existing webpage.
You MUST respond with ONLY a complete, valid HTML document - no explanations, no markdown, no code fences.
The code should be fully self-contained with inline CSS and JS and ready to render in a browser.
Follow these strict rules:
1. Only do what the user explicitly asks. Do not add extra sections, components, text, or styling beyond the request.
2. If the user asks for one change (for example a header), return only that change integrated into the existing page.
3. Treat each new prompt as an incremental edit to the existing page unless the user explicitly asks to replace or remove content.
4. Preserve all existing content and behavior by default.
5. Resolve references like "that", "it", "same", "this section" using prompt history context.
6. Remove content only when the user explicitly asks to remove or delete it.`;

const sanitizeGeneratedCode = (raw: string) => raw
  .replace(/```html/g, '')
  .replace(/```css/g, '')
  .replace(/```javascript/g, '')
  .replace(/```js/g, '')
  .replace(/```/g, '')
  .trim();

const extractUpstreamError = async (response: Response) => {
  let details = '';
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const errorPayload = (await response.json()) as OpenRouterErrorPayload;
      details = errorPayload.error?.message || errorPayload.message || JSON.stringify(errorPayload);
    } else {
      details = await response.text();
    }
  } catch {
    details = 'Unable to parse upstream error payload';
  }

  return details.trim() || 'Unknown upstream error';
};

const buildUserPrompt = (prompt: string, promptHistory: string[]) => {
  const normalizedHistory = promptHistory
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(-24);

  const historyBlock = normalizedHistory.length > 0
    ? normalizedHistory.map((item, index) => `${index + 1}. ${item}`).join('\n')
    : '(none)';

  return [
    `Current user request: ${prompt}`,
    'Prompt history (oldest to newest):',
    historyBlock,
    'Use this history for reference resolution, but only apply the current request as a minimal incremental update.',
    'Return exactly one complete updated HTML document.',
  ].join('\n\n');
};

// This is the API route handler for generating code based on user prompts.
export default async function handler(
  req: VercelRequest, // incoming request object containing method, body, etc.
  res: VercelResponse // outgoing response object used to send back status and data
) {
  const sendError = (
    status: number,
    error: string,
    details: string | null = null,
    attemptedModels: string[] = [],
    modelUsed: string | null = null
  ) => {
    const payload: GenerateErrorResponse = {
      success: false,
      code: null,
      modelUsed,
      attemptedModels,
      error,
      details,
    };

    return res.status(status).json(payload);
  };

  const sendSuccess = (code: string, modelUsed: string, attemptedModels: string[]) => {
    const payload: GenerateSuccessResponse = {
      success: true,
      code,
      modelUsed,
      attemptedModels,
      error: null,
      details: null,
    };

    return res.status(200).json(payload);
  };

  // Only allow POST requests because we're sending a prompt
  if (req.method !== 'POST') {
    return sendError(405, 'Method not allowed', 'Use POST /api/generate');
  }

  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : ''; // extract and validate prompt
  const promptHistory = Array.isArray(req.body?.promptHistory)
    ? req.body.promptHistory
      .filter((item: unknown) => typeof item === 'string')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)
      .slice(-24)
    : [];

  if (!prompt) {
    return sendError(400, 'Prompt is required', 'Request body must include a non-empty prompt string');
  }

  // The OpenRouter API key (will be loaded from environment variable)
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return sendError(500, 'API key not configured', 'Set OPENROUTER_API_KEY in environment variables');
  }

  const primaryModel = process.env.OPENROUTER_PRIMARY_MODEL || 'deepseek/deepseek-r1';
  const groqFallbackModel = process.env.GROQ_FALLBACK_MODEL || 'llama-3.1-8b-instant';
  const groqApiKey = process.env.GROQ_API_KEY;

  try {
    const vercelUrl = process.env.VERCEL_URL || 'http://localhost:5173';
    const referer = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
    const attemptedModels: string[] = [];

    const generateWithOpenRouter = async (model: string): Promise<ModelAttemptResult> => {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': referer,
            'X-Title': 'BuildWith AI',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: SYSTEM_PROMPT,
              },
              {
                role: 'user',
                content: buildUserPrompt(prompt, promptHistory),
              },
            ],
            temperature: 0.3,
            max_tokens: 4000,
          }),
        });

        if (!response.ok) {
          const details = await extractUpstreamError(response);
          return {
            ok: false,
            status: response.status,
            code: '',
            details,
          };
        }

        const data = await response.json();
        const generatedCode = typeof data?.choices?.[0]?.message?.content === 'string'
          ? data.choices[0].message.content
          : '';

        const cleanedCode = sanitizeGeneratedCode(generatedCode);

        if (!cleanedCode) {
          return {
            ok: false,
            status: 502,
            code: '',
            details: `Model ${model} returned empty code`,
          };
        }

        return {
          ok: true,
          status: 200,
          code: cleanedCode,
          details: '',
        };
      } catch (error) {
        return {
          ok: false,
          status: 500,
          code: '',
          details: error instanceof Error ? error.message : `Unexpected model error for ${model}`,
        };
      }
    };

    const generateWithGroq = async (model: string, key: string): Promise<ModelAttemptResult> => {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: SYSTEM_PROMPT,
              },
              {
                role: 'user',
                content: buildUserPrompt(prompt, promptHistory),
              },
            ],
            temperature: 0.3,
            max_tokens: 4000,
          }),
        });

        if (!response.ok) {
          const details = await extractUpstreamError(response);

          return {
            ok: false,
            status: response.status,
            code: '',
            details,
          };
        }

        const data = await response.json();
        const generatedCode = typeof data?.choices?.[0]?.message?.content === 'string'
          ? data.choices[0].message.content
          : '';

        const cleanedCode = sanitizeGeneratedCode(generatedCode);

        if (!cleanedCode) {
          return {
            ok: false,
            status: 502,
            code: '',
            details: `Model ${model} returned empty code`,
          };
        }

        return {
          ok: true,
          status: 200,
          code: cleanedCode,
          details: '',
        };
      } catch (error) {
        return {
          ok: false,
          status: 500,
          code: '',
          details: error instanceof Error ? error.message : `Unexpected model error for ${model}`,
        };
      }
    };

    const modelErrors: string[] = [];
    let bestStatus = 500;

    const primaryLabel = `openrouter:${primaryModel}`;
    attemptedModels.push(primaryLabel);
    console.info('Model attempt started:', primaryLabel);
    const primaryAttempt = await generateWithOpenRouter(primaryModel);

    if (primaryAttempt.ok) {
      console.info('Model used:', primaryLabel);
      return sendSuccess(primaryAttempt.code, primaryLabel, attemptedModels);
    }

    bestStatus = Math.max(bestStatus, primaryAttempt.status);
    modelErrors.push(`${primaryLabel}: ${primaryAttempt.details}`);
    console.error('OpenRouter model attempt failed:', primaryLabel, primaryAttempt.status, primaryAttempt.details);

    if (groqApiKey) {
      const fallbackLabel = `groq:${groqFallbackModel}`;
      attemptedModels.push(fallbackLabel);
      console.info('Model attempt started:', fallbackLabel);
      const fallbackAttempt = await generateWithGroq(groqFallbackModel, groqApiKey);

      if (fallbackAttempt.ok) {
        console.info('Model used:', fallbackLabel);
        return sendSuccess(fallbackAttempt.code, fallbackLabel, attemptedModels);
      }

      bestStatus = Math.max(bestStatus, fallbackAttempt.status);
      modelErrors.push(`${fallbackLabel}: ${fallbackAttempt.details}`);
      console.error('Groq model attempt failed:', fallbackLabel, fallbackAttempt.status, fallbackAttempt.details);
    } else {
      modelErrors.push('groq:fallback unavailable because GROQ_API_KEY is not set');
    }

    return sendError(
      bestStatus,
      'Generation failed across configured providers',
      modelErrors.join(' | '),
      attemptedModels,
      null
    );
  } catch (error) {
    console.error('Server error:', error);
    return sendError(500, 'Internal server error', 'Unexpected server failure while generating code');
  }
}