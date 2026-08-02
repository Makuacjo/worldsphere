/** Streaming client for the OpenRouter-powered ml-service /ai/ask endpoint. */

import { API_BASE_URL as API_BASE } from './apiConfig';

export class AiError extends Error {}

/**
 * Streams the answer token-by-token. Yields text chunks as they arrive.
 * Throws AiError with the server's detail (e.g. "AI is not configured").
 */
export async function* askStream(question: string, signal?: AbortSignal): AsyncGenerator<string> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new AiError(`Could not reach the AI service at ${API_BASE}. Is ml-service running?`);
  }

  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => null);
    throw new AiError(body?.detail ?? `AI request failed (${res.status}).`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}
