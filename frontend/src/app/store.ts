import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { messageReducer } from "../features/message";
import { billEntryReducer } from "../features/billEntry";
import { billingPartyReducers } from "../features/billingParty";
import { vehicleEntryReducer } from "../features/vehicleEntry";
import { balancePartyReducer } from "../features/balanceParty";
import { driverReducer } from "../features/driver";
import { truckReducers } from "../features/truck";
import { journeyReducers } from "../features/journey";
import { settlementReducers } from "../features/settlement";
import { ledgerReducers } from "../features/ledger";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        messages: messageReducer,
        billEntry: billEntryReducer,
        billingParty: billingPartyReducers,
        vehicleEntry: vehicleEntryReducer,
        balanceParty: balancePartyReducer,
        driver: driverReducer,
        truck: truckReducers,
        journey: journeyReducers,
        settlement: settlementReducers,
        ledger: ledgerReducers
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;