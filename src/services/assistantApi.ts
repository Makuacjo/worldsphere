export type AssistantType = 'SPECIES' | 'TOUR_GUIDE';
import { API_BASE_URL as API_BASE } from './apiConfig';
export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id?: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
}

export interface ConversationSummary {
  id: string;
  assistant_type: AssistantType;
  title: string | null;
  created_at: string;
  updated_at: string;
  preview?: string;
}

export interface ConversationDetail {
  id: string;
  assistantType: AssistantType;
  title: string | null;
  messages: ChatMessage[];
}

const TOKEN_KEY = 'worldsphere_token';
const SESSION_KEY = 'worldsphere_ai_session';

const sessionId = () => {
  let value = localStorage.getItem(SESSION_KEY);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, value);
  }
  return value;
};

const headers = (json = false): HeadersInit => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    'X-WorldSphere-Session': sessionId(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseError = async (response: Response) => {
  const body = await response.json().catch(() => null);
  throw new Error(body?.detail ?? `AI request failed (${response.status}).`);
};

export async function streamAssistantChat(
  input: {
    assistantType: AssistantType;
    conversationId?: string;
    messages: ChatMessage[];
    context?: Record<string, unknown>;
  },
  options: {
    signal?: AbortSignal;
    onConversation?: (id: string) => void;
    onChunk: (chunk: string) => void;
  },
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify(input),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error(`Could not reach the AI service at ${API_BASE}.`, { cause: error });
  }
  if (!response.ok || !response.body) await parseError(response);
  const conversationId = response.headers.get('X-Conversation-Id');
  if (conversationId) options.onConversation?.(conversationId);
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    options.onChunk(decoder.decode(value, { stream: true }));
  }
}

export async function listConversations(type: AssistantType): Promise<ConversationSummary[]> {
  const response = await fetch(`${API_BASE}/api/ai/conversations?assistantType=${type}`, { headers: headers() });
  if (!response.ok) await parseError(response);
  return response.json();
}

export async function getConversation(id: string, type: AssistantType): Promise<ConversationDetail> {
  const response = await fetch(`${API_BASE}/api/ai/conversations/${encodeURIComponent(id)}?assistantType=${type}`, { headers: headers() });
  if (!response.ok) await parseError(response);
  return response.json();
}

export async function renameConversation(id: string, type: AssistantType, title: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/ai/conversations/${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: headers(true), body: JSON.stringify({ assistantType: type, title }),
  });
  if (!response.ok) await parseError(response);
}

export async function deleteConversation(id: string, type: AssistantType): Promise<void> {
  const response = await fetch(`${API_BASE}/api/ai/conversations/${encodeURIComponent(id)}?assistantType=${type}`, {
    method: 'DELETE', headers: headers(),
  });
  if (!response.ok) await parseError(response);
}

export async function sendFeedback(messageId: string, rating: -1 | 1): Promise<void> {
  const response = await fetch(`${API_BASE}/api/ai/feedback`, {
    method: 'POST', headers: headers(true), body: JSON.stringify({ messageId, rating }),
  });
  if (!response.ok) await parseError(response);
}

export async function claimAnonymousConversations(): Promise<number> {
  const response = await fetch(`${API_BASE}/api/ai/conversations/claim`, { method: 'POST', headers: headers() });
  if (!response.ok) await parseError(response);
  return (await response.json()).claimed;
}