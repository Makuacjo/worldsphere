/** Auth + favorites API client for the ml-service. */

import { API_BASE_URL as API_BASE } from './apiConfig';

export interface User { id: number; name: string; email: string; }
export interface Favorite {
  id: number;
  key: string;
  source: string;         // 'gbif' | 'catalog'
  name: string;
  scientificName?: string | null;
  image?: string | null;
}
export type FavoriteInput = Omit<Favorite, 'id'>;

export class AuthApiError extends Error {}

const request = async <T>(path: string, options: RequestInit = {}, token?: string): Promise<T> => {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new AuthApiError(`Could not reach the account service at ${API_BASE}. Is ml-service running?`);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new AuthApiError(body?.detail ?? `Request failed (${res.status}).`);
  }
  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>);
};

interface AuthResult { token: string; user: User; }

export const apiSignup = (name: string, email: string, password: string) =>
  request<AuthResult>('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });

export const apiLogin = (email: string, password: string) =>
  request<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const apiMe = (token: string) => request<User>('/auth/me', {}, token);

export const apiGetFavorites = (token: string) => request<Favorite[]>('/favorites', {}, token);

export const apiAddFavorite = (token: string, fav: FavoriteInput) =>
  request<Favorite>('/favorites', { method: 'POST', body: JSON.stringify(fav) }, token);

export const apiRemoveFavorite = (token: string, source: string, key: string) =>
  request<void>(`/favorites/${encodeURIComponent(source)}/${encodeURIComponent(key)}`, { method: 'DELETE' }, token);
