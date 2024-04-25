// src/store/chatStore.ts
import create from 'zustand';

export const useChatStore = create<Chatspace.ChatState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, ...message] })),
  setMessage: (message) => set((state) => ({ messages: [...state.messages, message] }))
}));