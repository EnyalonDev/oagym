import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, reconstructUser } from '@/lib/auth-types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;

  // Actions
  setSession: (userData: any, token: string, sessionId?: string) => void;
  setUser: (userData: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateLastActivity: () => void;
  logout: () => void;
  isAdmin: () => boolean;
}

const STORAGE_KEYS_TO_PURGE = [
  'oa_gym_auth_storage',
  'auth_token',
  'user_data',
  'last_activity',
  'auth-storage',
  'oa_gym_member_session',
  'oa_gym_admin_auth',
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      currentSessionId: null,
      isLoading: false,
      error: null,
      lastActivity: Date.now(),

      setSession: (userData: any, token: string, sessionId?: string) => {
        const reconstructed = reconstructUser(userData);
        const resolvedSessionId = sessionId || reconstructed.last_session_id || `sess_${Date.now()}`;
        set({
          user: reconstructed,
          token,
          isAuthenticated: true,
          currentSessionId: resolvedSessionId,
          error: null,
          isLoading: false,
          lastActivity: Date.now(),
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('userUpdated'));
          window.dispatchEvent(new Event('oa_gym_data_change'));
        }
      },

      setUser: (userData: any) => {
        const reconstructed = reconstructUser(userData);
        set({
          user: reconstructed,
          error: null,
          lastActivity: Date.now(),
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('userUpdated'));
          window.dispatchEvent(new Event('oa_gym_data_change'));
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      updateLastActivity: () => set({ lastActivity: Date.now() }),

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          currentSessionId: null,
          error: null,
          isLoading: false,
        });

        if (typeof window !== 'undefined') {
          STORAGE_KEYS_TO_PURGE.forEach((key) => {
            try {
              localStorage.removeItem(key);
            } catch {}
          });
          try {
            sessionStorage.clear();
          } catch {}
          window.dispatchEvent(new Event('userUpdated'));
          window.dispatchEvent(new Event('oa_gym_data_change'));
        }
      },

      isAdmin: () => {
        const user = get().user;
        if (!user) return false;
        const role = user.external_permissions?.role;
        return role === 'admin' || role === 'staff_admin' || user.role_id === 1;
      },
    }),
    {
      name: 'oa_gym_auth_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        currentSessionId: state.currentSessionId,
        lastActivity: state.lastActivity,
      }),
    }
  )
);
