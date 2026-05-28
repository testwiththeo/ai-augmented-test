import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openai) {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not set. AI features are disabled.");
    }
    openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      baseURL: OPENAI_BASE_URL,
    });
  }
  return openai;
}

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.code === 429;
      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.log(`[AI] Rate limited. Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Retry exhausted");
}

export async function suggestSelectors(
  failedSelector: string,
  domSnippet: string,
  elementDescription: string
): Promise<string[]> {
  if (!OPENAI_API_KEY) return [];

  const prompt = `You are a QA automation expert. A Playwright test failed because the selector "${failedSelector}" could not find the element.

The element we're looking for is: "${elementDescription}"

Here is the DOM snippet around where the element should be:

${domSnippet}

Analyze the DOM and suggest 3-5 alternative Playwright selectors that would find the correct element. Follow best practices:
1. Prefer role selectors (getByRole)
2. Fall back to text, placeholder, label, or testid
3. Only use CSS selectors as last resort

Return ONLY a JSON array of strings, nothing else. Example:
["page.getByRole('button', { name: 'Submit' })", "page.getByText('Submit')"]`;

  try {
    const client = getClient();
    const response = await retryWithBackoff(() =>
      client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 300,
      })
    );

    const text = response.choices[0]?.message?.content?.trim() || "[]";
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("[AI] OpenAI request failed:", error);
    return [];
  }
}

export async function analyzeFailure(
  errorMessage: string,
  testName: string,
  domSnapshot: string
): Promise<string> {
  if (!OPENAI_API_KEY) return "AI analysis unavailable (no API key)";

  const prompt = `You are a QA engineer analyzing a test failure.

Test: "${testName}"
Error: "${errorMessage}"

DOM Snapshot (abbreviated):
${domSnapshot.substring(0, 3000)}

Provide a concise root cause analysis and potential fix. Keep it under 100 words.`;

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content?.trim() || "No analysis generated.";
  } catch (error) {
    console.error("[AI] Failure analysis failed:", error);
    return "AI analysis unavailable due to API error.";
  }
}
