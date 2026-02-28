import { create } from 'zustand';

interface User {
    id: string;
    username: string;
    email: string;
    fullname: string;
    isAdmin: boolean;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    authStart: () => void;
    authSuccess: (user: User) => void;
    authEnd: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: false,
    authStart: () => set({ loading: true }),
    authSuccess: (user) => set({ user, loading: false }),
    authEnd: () => set({ loading: false }),
    logout: () => set({ user: null }),
}));
