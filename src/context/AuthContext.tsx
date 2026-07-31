import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  apiSignup, apiLogin, apiMe, apiGetFavorites, apiAddFavorite, apiRemoveFavorite,
  type User, type Favorite, type FavoriteInput,
} from '../services/auth';
import { AuthContext } from './auth';
import { claimAnonymousConversations } from '../services/assistantApi';
import { createTrip, createTripPlan, type SavedTripInput } from '../services/accountApi';

const TOKEN_KEY = 'worldsphere_token';
const PENDING_FAVORITE_KEY = 'worldsphere_pending_favorite';
const AUTH_RETURN_KEY = 'worldsphere_auth_return';
const PENDING_TRIP_KEY = 'worldsphere_pending_trip';
const PENDING_PLAN_KEY = 'worldsphere_pending_plan';
const favId = (source: string, key: string) => `${source}:${key}`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(() => token !== null);

  const applySession = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken); setToken(nextToken); setUser(nextUser);
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); setFavorites([]); setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    Promise.all([apiMe(token), apiGetFavorites(token)])
      .then(([me, favs]) => { if (alive) { setUser(me); setFavorites(favs); } })
      .catch(() => { if (alive) logout(); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [token, logout]);

  const completePendingFavorite = async (sessionToken: string) => {
    const raw = sessionStorage.getItem(PENDING_FAVORITE_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_FAVORITE_KEY);
    const pending = JSON.parse(raw) as FavoriteInput;
    const created = await apiAddFavorite(sessionToken, pending);
    setFavorites(prev => [created, ...prev.filter(f => favId(f.source, f.key) !== favId(created.source, created.key))]);
  };
  const completePendingTrip = async () => {
    const raw = sessionStorage.getItem(PENDING_TRIP_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_TRIP_KEY);
    await createTrip(JSON.parse(raw));
  };  const completePendingPlan = async () => {
    const raw = sessionStorage.getItem(PENDING_PLAN_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_PLAN_KEY);
    await createTripPlan(JSON.parse(raw));
  };  const signup = async (name: string, email: string, password: string) => {
    const { token: next, user: nextUser } = await apiSignup(name, email, password);
    applySession(next, nextUser); setFavorites([]); await claimAnonymousConversations().catch(() => 0); await completePendingFavorite(next); await completePendingTrip(); await completePendingPlan();
  };
  const login = async (email: string, password: string) => {
    const { token: next, user: nextUser } = await apiLogin(email, password);
    applySession(next, nextUser); setFavorites(await apiGetFavorites(next).catch(() => [])); await claimAnonymousConversations().catch(() => 0); await completePendingFavorite(next); await completePendingTrip(); await completePendingPlan();
  };
  const isFavorite = (source: string, key: string) => favorites.some(f => favId(f.source, f.key) === favId(source, key));
  const toggleFavorite = async (fav: FavoriteInput) => {
    if (!token) throw new Error('Sign in to save favorites.');
    if (isFavorite(fav.source, fav.key)) {
      const previous = favorites;
      setFavorites(prev => prev.filter(f => favId(f.source, f.key) !== favId(fav.source, fav.key)));
      try { await apiRemoveFavorite(token, fav.source, fav.key); }
      catch (error) { setFavorites(previous); throw error; }
    } else {
      const optimistic: Favorite = { id: -Date.now(), ...fav };
      setFavorites(prev => [optimistic, ...prev.filter(f => favId(f.source, f.key) !== favId(fav.source, fav.key))]);
      try {
        const created = await apiAddFavorite(token, fav);
        setFavorites(prev => [created, ...prev.filter(f => favId(f.source, f.key) !== favId(created.source, created.key))]);
      } catch (error) {
        setFavorites(prev => prev.filter(f => favId(f.source, f.key) !== favId(fav.source, fav.key)));
        throw error;
      }
    }
  };
  const queueTripAfterAuth = (pendingTrip: Partial<SavedTripInput> & { title: string }, returnTo: string) => {
    sessionStorage.setItem(PENDING_TRIP_KEY, JSON.stringify(pendingTrip));
    sessionStorage.setItem(AUTH_RETURN_KEY, returnTo);
  };
  const queueFavoriteAfterAuth = (favorite: FavoriteInput, returnTo: string) => {
    sessionStorage.setItem(PENDING_FAVORITE_KEY, JSON.stringify(favorite));
    sessionStorage.setItem(AUTH_RETURN_KEY, returnTo);
  };

  return <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, signup, login, logout,
    favorites, isFavorite, toggleFavorite, queueFavoriteAfterAuth, queueTripAfterAuth }}>{children}</AuthContext.Provider>;
};