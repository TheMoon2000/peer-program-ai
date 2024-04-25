declare namespace Chatspace {
    export interface ChatMessage {
        sender: string
        timestamp: string // ISO 8601 string
        message_id?: number // indexed from 0
        content: {
            type: "text" | "choices",
            value: string | string[]
            choice_index?: number
        }[]
    }
    export interface ChatState {
        messages: Chatspace.ChatMessage[];
        addMessage: (message: Chatspace.ChatMessage[]) => void;
        setMessage: (message: Chatspace.ChatMessage) => void;
    }
}