import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore, MAX_USER_MESSAGES } from '../../state/chatStore.js';

function reset() {
  useChatStore.setState({ messages: [], userMessageCount: 0, pendingConfirmation: null, conversations: [] });
}

describe('chatStore', () => {
  beforeEach(reset);

  it('addUserMessage appends and returns the incrementing count', () => {
    const { addUserMessage } = useChatStore.getState();
    expect(addUserMessage({ role: 'user', content: 'hi' })).toBe(1);
    expect(addUserMessage({ role: 'user', content: 'again' })).toBe(2);
    expect(useChatStore.getState().messages).toHaveLength(2);
    expect(useChatStore.getState().userMessageCount).toBe(2);
  });

  it('archiveCurrent seals the conversation and clears the active slate', () => {
    const s = useChatStore.getState();
    s.addUserMessage({ role: 'user', content: 'first question' });
    s.appendMessage({ role: 'assistant', content: 'an answer' });

    const archived = useChatStore.getState().archiveCurrent('manual');
    expect(archived).toBe(true);

    const after = useChatStore.getState();
    expect(after.messages).toEqual([]);
    expect(after.userMessageCount).toBe(0);
    expect(after.conversations).toHaveLength(1);
    expect(after.conversations[0].title).toBe('first question');
    expect(after.conversations[0].messages).toHaveLength(2);
  });

  it('archiveCurrent is a no-op when there is no real conversation', () => {
    const s = useChatStore.getState();
    s.appendMessage({ role: 'system', content: 'just a system note' });
    expect(useChatStore.getState().archiveCurrent()).toBe(false);
    expect(useChatStore.getState().conversations).toHaveLength(0);
    // active slate is still cleared
    expect(useChatStore.getState().messages).toEqual([]);
  });

  it('seals after the user sends MAX_USER_MESSAGES and starts fresh', () => {
    const s = useChatStore.getState();
    let count = 0;
    for (let i = 0; i < MAX_USER_MESSAGES; i++) {
      count = useChatStore.getState().addUserMessage({ role: 'user', content: `msg ${i}` });
      useChatStore.getState().appendMessage({ role: 'assistant', content: `reply ${i}` });
    }
    expect(count).toBe(MAX_USER_MESSAGES);

    // Component seals once the limit is reached
    useChatStore.getState().archiveCurrent('limit');
    const after = useChatStore.getState();
    expect(after.userMessageCount).toBe(0);
    expect(after.messages).toEqual([]);
    expect(after.conversations).toHaveLength(1);
    expect(after.conversations[0].reason).toBe('limit');
    expect(after.conversations[0].messages).toHaveLength(MAX_USER_MESSAGES * 2);
  });

  it('keeps newest conversations first and caps the archive at 50', () => {
    for (let i = 0; i < 55; i++) {
      useChatStore.getState().addUserMessage({ role: 'user', content: `conversation ${i}` });
      useChatStore.getState().archiveCurrent('manual');
    }
    const { conversations } = useChatStore.getState();
    expect(conversations).toHaveLength(50);
    // Most recent (index 54) sits at the front
    expect(conversations[0].title).toBe('conversation 54');
  });
});
