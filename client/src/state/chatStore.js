import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// A conversation with the companion auto-seals after this many user messages.
export const MAX_USER_MESSAGES = 10;

// Keep the archive bounded so localStorage never grows without limit.
const MAX_ARCHIVED = 50;

function makeTitle(messages) {
  const firstUser = messages.find((m) => m.role === 'user');
  const text = firstUser?.content?.trim();
  if (!text) return 'A brief exchange';
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

export const useChatStore = create(
  persist(
    (set, get) => ({
      // ── Active conversation ──────────────────────────────────────────────
      messages: [],
      userMessageCount: 0,
      pendingConfirmation: null,

      // ── Archived conversations ("Echoes") ────────────────────────────────
      conversations: [],

      appendMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      // Adds a user message and bumps the counter; returns the new count so the
      // caller can decide whether the 10-message limit was reached this turn.
      addUserMessage: (msg) => {
        const userMessageCount = get().userMessageCount + 1;
        set((state) => ({ messages: [...state.messages, msg], userMessageCount }));
        return userMessageCount;
      },

      setPendingConfirmation: (pendingConfirmation) => set({ pendingConfirmation }),

      // Seal the current conversation into the Echoes archive and clear the
      // active slate. No-op when there is nothing worth keeping.
      archiveCurrent: (reason = 'manual') => {
        const { messages, conversations } = get();
        const hasContent = messages.some((m) => m.role !== 'system');
        if (!hasContent) {
          set({ messages: [], userMessageCount: 0, pendingConfirmation: null });
          return false;
        }
        const convo = {
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          title: makeTitle(messages),
          messages,
          endedAt: new Date().toISOString(),
          reason
        };
        set({
          conversations: [convo, ...conversations].slice(0, MAX_ARCHIVED),
          messages: [],
          userMessageCount: 0,
          pendingConfirmation: null
        });
        return true;
      },

      startNewChat: () => get().archiveCurrent('manual')
    }),
    {
      name: 'pet-chat-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
