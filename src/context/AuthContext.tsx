import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface User {
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    signup: (name: string, email: string) => void;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'worldsphere_user';

/**
 * IMPORTANT — this is a front-end-only placeholder, not real authentication.
 *
 * There is no backend yet (see SCHEMA.md), so this context can't actually verify
 * a password — it exists purely so the Signup/Login/Profile pages have something
 * to call. It intentionally never accepts or stores a password anywhere, even in
 * localStorage, so nobody mistakes this for something secure.
 *
 * When the real API exists, replace `signup`/`login` below with requests to
 * POST /api/auth/signup and /api/auth/login (see SCHEMA.md's User model), and
 * store the returned JWT/session instead of a plain user object.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        try {
            setUser(JSON.parse(stored));
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const persist = (next: User | null) => {
        setUser(next);
        if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        else localStorage.removeItem(STORAGE_KEY);
    };

    const signup = (name: string, email: string) => persist({ name, email });
    const login = (email: string) => persist({ name: email.split('@')[0], email });
    const logout = () => persist(null);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, signup, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
