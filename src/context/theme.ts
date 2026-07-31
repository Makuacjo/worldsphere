import { createContext, useContext } from 'react';
export type Theme = 'light' | 'dark';
export interface ThemeContextType {
  theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void;
}
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within a ThemeProvider');
  return value;
};
