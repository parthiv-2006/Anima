import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (token, user) => {
        console.log('🔐 setAuth called with token:', !!token);
        set({ token, user, isAuthenticated: true, isHydrated: true });
      },
      
      clearAuth: () => {
        console.log('🔓 clearAuth called');
        set({ token: null, user: null, isAuthenticated: false, isHydrated: true });
      },
      
      setHydrated: () => {
        console.log('💧 Zustand hydrated from localStorage');
        set({ isHydrated: true });
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Hydration error:', error);
        } else {
          console.log('✅ Hydration complete, isAuthenticated:', state?.isAuthenticated);
          // Mark as hydrated so App knows localStorage state is ready
          state?.setHydrated();
        }
      }
    }
  )
);
