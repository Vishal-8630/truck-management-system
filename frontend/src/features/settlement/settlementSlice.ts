import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type EntityId,
} from "@reduxjs/toolkit";
import api from "../../api/axios";
import type { RootState } from "../../app/store";
import normalizedError from "../../utils/normalizedError";
import type {
  SettlementResponseType,
  SettlementType,
} from "../../types/settlement";

/* ------------------ Adapter ------------------- */
export const settlementAdapter = createEntityAdapter<SettlementType, EntityId>({
  selectId: (entry) => entry._id,
});

/* ------------------ Async Thunks ------------------- */

// Fetch all settlements
export const fetchSettlementsAsync = createAsyncThunk<
  SettlementType[],
  void,
  { rejectValue: string }
>("settlement/fetchAll", async (_, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.get("/settlements");
    return response.data.data as SettlementType[];
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch settlements");
  }
});

// 1️⃣ Fetch Settlement Preview
export const fetchSettlementPreviewAsync = createAsyncThunk<
  SettlementResponseType,
  {
    driverId: string;
    from: string;
    to: string;
    ratePerKm: string;
    dieselRate: string;
    extraExpense: string;
  },
  { rejectValue: string }
>(
  "settlement/preview",
  async (
    { driverId, from, to, ratePerKm, dieselRate, extraExpense },
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.get("/settlements/preview", {
        params: { driverId, from, to, ratePerKm, dieselRate, extraExpense },
      });
      return res.data as SettlementResponseType;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch settlement preview"
      );
    }
  }
);

// 2️⃣ Confirm Settlement
export const confirmSettlementAsync = createAsyncThunk<
  any,
  { data: any; period: any; driver: any },
  { rejectValue: Record<string, string> }
>("settlement/confirm", async (payload, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const res = await api.post("/settlements/confirm", payload);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      normalizedError(err, "Failed to confirm settlement")
    );
  }
});

/* ------------------ Slice ------------------- */

const settlementSlice = createSlice({
  name: "settlement",
  initialState: settlementAdapter.getInitialState({
    loading: false,
  }),
  reducers: {},
  extraReducers: (builder) => {
    // === Fetch All ===
    builder
      .addCase(fetchSettlementsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettlementsAsync.fulfilled, (state, action) => {
        state.loading = false;
        settlementAdapter.setAll(state, action.payload);
      })
      .addCase(fetchSettlementsAsync.rejected, (state) => {
        state.loading = false;
      });
      
    // === Fetch Preview ===
    builder
      .addCase(fetchSettlementPreviewAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettlementPreviewAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchSettlementPreviewAsync.rejected, (state) => {
        state.loading = false;
      });

    // === Confirm Settlement ===
    builder
      .addCase(confirmSettlementAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(confirmSettlementAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(confirmSettlementAsync.rejected, (state) => {
        state.loading = false;
      });
  },
});

/* ------------------ Selectors ------------------- */
export const selectSettlementLoading = (state: RootState) =>
  state.settlement.loading;

export const settlementSelectors = settlementAdapter.getSelectors(
  (state: RootState) => state.settlement
);

/* ------------------ Exports ------------------- */
export default settlementSlice.reducer;
