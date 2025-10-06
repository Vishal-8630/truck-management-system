import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Message {
    id: string;
    type: "success" | "error" | "info";
    text: string;
}

const initialState: Message[] = [];

const messageSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<Omit<Message, "id">>) => {
            const id = new Date().getTime().toString();
            state.push({ id, ...action.payload });
        },
        removeMessage: (state, action: PayloadAction<string>) => {
            return state.filter(message => message.id !== action.payload);
        },
    }
});

export const { addMessage, removeMessage } = messageSlice.actions;
export default messageSlice.reducer;