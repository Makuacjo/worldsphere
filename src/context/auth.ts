import { createContext, useContext } from 'react';
import type { Favorite, FavoriteInput, User } from '../services/auth';
import type { SavedTripInput } from '../services/accountApi';

export interface AuthContextType {
  user: User | null; isAuthenticated: boolean; loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>; logout: () => void;
  favorites: Favorite[]; isFavorite: (source: string, key: string) => boolean;
  toggleFavorite: (favorite: FavoriteInput) => Promise<void>;
  queueFavoriteAfterAuth: (favorite: FavoriteInput, returnTo: string) => void;
  queueTripAfterAuth: (trip: Partial<SavedTripInput> & { title: string }, returnTo: string) => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within an AuthProvider');
  return value;
};
