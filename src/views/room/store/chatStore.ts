// src/store/chatStore.ts
import StoreUtility from '@/utils/store';
import { create } from 'zustand';

export const useChatStore = create<Chatspace.ChatState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, ...message] })),
  setMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  makeChoice: (message) => set((state) => {
    for (const msg of state.messages) {
      if (msg.message_id === message.message_id) {
        msg.content[message.content_index].choice_index = message.choice_index
        break
      }
    }
    return {
      messages: [...state.messages]
    }
  }),
  typingState: (message) => set((state) => {
    if (message.event === 'start_typing') {
      console.log('start_typing', message)
      let existTyping: boolean = false
      for (let index = 0; index < state.messages.length; index++) {
        const element = state.messages[index];
        if (element.sender === message.sender && element.event === message.event) {
          existTyping = true
        }
      }
      if (existTyping) {
        return { messages: StoreUtility.removeDuplicates(state.messages) }
      } else {
        return { messages: [...state.messages, message] }
      }
    } else {
      return { messages: StoreUtility.clearEventBySender(message.sender, state.messages) }
    }
  })
}));
// 创建全局状态
export const useGlobalStore = create<Chatspace.GlobalStore>((set) => ({
  preference: { inputHeight: 0, },
  updatePreference: (newPreference) => {
    set((state) => ({
      preference: {
        ...state.preference,
        ...newPreference,
      },
    }));
  },
}));
