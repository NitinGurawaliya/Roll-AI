import OpenAI from "openai";

let client: OpenAI | null = null;

/** Lazily-instantiated shared OpenAI client. */
export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export const MODEL = "gpt-4o";

/**
 * Call the model with a system + user prompt and parse a JSON object response.
 * Uses response_format json_object so the model always returns valid JSON.
 */
export async function completeJSON<T>(
  system: string,
  user: string
): Promise<T> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";
  if (!raw.trim()) {
    throw new Error("Empty response from model");
  }
  return JSON.parse(raw) as T;
}
