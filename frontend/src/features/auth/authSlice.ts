import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  username: string;
  email: string;
  fullname: string;
  isAdmin: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
    },
    authSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
    },
    authEnd: (state) => {
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
    }
  },
});

export const { authStart, authSuccess, authEnd, logout } =
  authSlice.actions;

export default authSlice.reducer;