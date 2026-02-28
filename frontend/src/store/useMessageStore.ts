import { create } from 'zustand';

interface Message {
    id: string;
    type: "success" | "error" | "info";
    text: string;
}

interface MessageState {
    messages: Message[];
    addMessage: (message: Omit<Message, "id">) => void;
    removeMessage: (id: string) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
    messages: [],
    addMessage: (message) => set((state) => {
        const id = new Date().getTime().toString();
        return { messages: [...state.messages, { id, ...message }] };
    }),
    removeMessage: (id) => set((state) => ({
        messages: state.messages.filter((m) => m.id !== id),
    })),
}));
