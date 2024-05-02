declare namespace Chatspace {
    type Preference = {
        inputHeight: number;
    };
    export interface ChatMessage {
        sender: string
        timestamp?: string // ISO 8601 string
        message_id?: number // indexed from 0
        name?: string
        content?: {
            type: "text" | "choices" | "typing" | string,
            value: string | string[]
            choice_index?: number
        }[],
        system_message?: string // e.g. “User X has left the room.”
        content_index?: number,
        choice_index?: number,
        event?: string,

    }
    export interface ChatState {
        messages: Chatspace.ChatMessage[];
        addMessage: (message: Chatspace.ChatMessage[]) => void;
        setMessage: (message: Chatspace.ChatMessage) => void;
        makeChoice: (message: Chatspace.ChatMessage) => void;
        typingState: (message: Chatspace.ChatMessage) => void;
    }

    export interface GlobalStore {
        preference: Preference;
        updatePreference: (newPreference: Partial<Preference>) => void;
    }
    export interface InputNewMessageStore {
        inputNewMessage: string;
        updateNewMessage: (newMessage: string) => void;
        clearNewMessage: () => void;
    }
}