import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (token, user) => {
        set({ token, user, isAuthenticated: true, isHydrated: true });
      },

      clearAuth: () => {
        set({ token: null, user: null, isAuthenticated: false, isHydrated: true });
      },

      setHydrated: () => {
        set({ isHydrated: true });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // isHydrated is runtime-only state; persisting it would let a stale
      // "false" from storage clobber the live flag during rehydration.
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth hydration error:', error);
        }
        state?.setHydrated();
      }
    }
  )
);

// localStorage hydration is synchronous; guarantee the gate opens even if the
// rehydration callback ordering changes between zustand versions.
useAuthStore.setState({ isHydrated: true });
