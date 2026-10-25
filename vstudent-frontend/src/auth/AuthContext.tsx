import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { Credentials } from '../api/types';
import { getCurrentTeacher, registerTeacher } from '../api/client';

interface AuthState {
    credentials: Credentials;
    teacherName: string;
    role: 'TEACHER' | 'ADMIN';
}

interface AuthContextValue {
    auth: AuthState | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateStoredPassword: (newPassword: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthState | null>(null);

    const login = useCallback(async (email: string, password: string) => {
        const credentials = { email, password };
        const profile = await getCurrentTeacher(credentials); // yanlış məlumatda ApiError(401)
        setAuth({ credentials, teacherName: profile.name, role: profile.role });
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const profile = await registerTeacher(name, email, password);
        setAuth({ credentials: { email, password }, teacherName: profile.name, role: profile.role });
    }, []);

    const logout = useCallback(() => setAuth(null), []);

    // Basic Auth hər sorğuda parolu göndərir; parol dəyişəndən sonra brauzer
    // dərhal yenisini göndərməlidir, əks halda növbəti sorğu 401 verər.
    const updateStoredPassword = useCallback((newPassword: string) => {
        setAuth((prev) => (prev ? { ...prev, credentials: { ...prev.credentials, password: newPassword } } : prev));
    }, []);

    return (
        <AuthContext.Provider value={{ auth, login, register, logout, updateStoredPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}