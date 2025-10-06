import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { messageReducer } from "../features/message";
import { billEntryReducer } from "../features/billEntry";
import { billingPartyReducers } from "../features/billingParty";
import { vehicleEntryReducer } from "../features/vehicleEntry";
import { balancePartyReducer } from "../features/balanceParty";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        messages: messageReducer,
        billEntry: billEntryReducer,
        billingParty: billingPartyReducers,
        vehicleEntry: vehicleEntryReducer,
        balanceParty: balancePartyReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;