// src/store/chatStore.ts
import create from 'zustand';

export const useChatStore = create<Chatspace.ChatState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, ...message] })),
  setMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  makeChoice: (message) => set((state) => {
    state.messages[message.message_id].content[message.content_index].choice_index = message.choice_index
    return {
      messages: [...state.messages]
    }
  })
}));
export const useInputMessageStore = create<Chatspace.InputNewMessageStore>((set) => ({
  inputNewMessage: '',
  updateNewMessage: (newMessage) => set((state) => ({ inputNewMessage: newMessage })),
  clearNewMessage: () => set(() => ({ inputNewMessage: '' })),
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
