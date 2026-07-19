import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  apiSignup, apiLogin, apiMe, apiGetFavorites, apiAddFavorite, apiRemoveFavorite,
  type User, type Favorite, type FavoriteInput,
} from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // favorites
  favorites: Favorite[];
  isFavorite: (source: string, key: string) => boolean;
  toggleFavorite: (fav: FavoriteInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = 'worldsphere_token';

const favId = (source: string, key: string) => `${source}:${key}`;

/**
 * Real authentication against the ml-service (signed token in localStorage) plus
 * per-user favorites. Replaces the earlier front-end-only placeholder.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setFavorites([]);
  }, []);

  // Rehydrate from a stored token on mount.
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    let alive = true;
    Promise.all([apiMe(token), apiGetFavorites(token)])
      .then(([me, favs]) => {
        if (!alive) return;
        setUser(me);
        setFavorites(favs);
      })
      .catch(() => { if (alive) logout(); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [token, logout]);

  const signup = async (name: string, email: string, password: string) => {
    const { token: t, user: u } = await apiSignup(name, email, password);
    applySession(t, u);
    setFavorites([]);
  };

  const login = async (email: string, password: string) => {
    const { token: t, user: u } = await apiLogin(email, password);
    applySession(t, u);
    setFavorites(await apiGetFavorites(t).catch(() => []));
  };

  const isFavorite = (source: string, key: string) =>
    favorites.some(f => favId(f.source, f.key) === favId(source, key));

  const toggleFavorite = async (fav: FavoriteInput) => {
    if (!token) throw new Error('Sign in to save favorites.');
    if (isFavorite(fav.source, fav.key)) {
      // Optimistic remove.
      setFavorites(prev => prev.filter(f => favId(f.source, f.key) !== favId(fav.source, fav.key)));
      await apiRemoveFavorite(token, fav.source, fav.key).catch(() => {});
    } else {
      const created = await apiAddFavorite(token, fav);
      setFavorites(prev => [created, ...prev.filter(f => favId(f.source, f.key) !== favId(fav.source, fav.key))]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        signup,
        login,
        logout,
        favorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
