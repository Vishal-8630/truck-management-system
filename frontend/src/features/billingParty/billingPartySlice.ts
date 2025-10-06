import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type EntityId,
} from "@reduxjs/toolkit";
import type { BillingPartyType } from "../../types/billingParty";
import api from "../../api/axios";
import type { RootState } from "../../app/store";
import normalizedError from "../../utils/normalizedError";

/* -------------------- Adapter ------------------- */
export const billingPartyAdapter = createEntityAdapter<
  BillingPartyType,
  EntityId
>({
  selectId: (party) => party._id,
});

/* ------------------ Async Thunk ---------------- */

// Fetch all billing parties
export const fetchBillingPartiesAsync = createAsyncThunk<
  BillingPartyType[],
  void,
  { rejectValue: string }
>("billingParty/fetchAll", async (_, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.get("/billing-party/all");
    return response.data.data as BillingPartyType[];
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch billing parties");
  }
});

// Add a new billing party
export const addBillingPartyAsync = createAsyncThunk<
  BillingPartyType,
  Omit<BillingPartyType, "_id">,
  { rejectValue: Record<string, string> }
>("billingParty/add", async (newParty, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.post("/billing-party/new", newParty);
    return response.data.data as BillingPartyType;
  } catch (err: any) {
    return rejectWithValue(normalizedError(err, "Failed to add billing party"));
  }
});

// Update a billing party
export const updateBillingPartyAsync = createAsyncThunk<
  BillingPartyType,
  BillingPartyType,
  { rejectValue: Record<string, string> }
>("billingParty/update", async (updatedParty, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.put(
      `/billing-party/update/${updatedParty._id}`,
      updatedParty
    );
    return response.data.data as BillingPartyType;
  } catch (err: any) {
    return rejectWithValue(normalizedError(err, "Failed to update billing party"));
  }
});

// Delete a billing party
export const deleteBillingPartyAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("billingParty/delete", async (_id, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    await api.delete(`/billing-party/${_id}`);
    return _id;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to delete billing party");
  }
});

const billingPartySlice = createSlice({
  name: "billingParty",
  initialState: billingPartyAdapter.getInitialState({
    loading: false,
  }),
  reducers: {},
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchBillingPartiesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBillingPartiesAsync.fulfilled, (state, action) => {
        state.loading = false;
        billingPartyAdapter.setAll(state, action.payload);
      })
      .addCase(fetchBillingPartiesAsync.rejected, (state) => {
        state.loading = false;
      });

    // Add
    builder
      .addCase(addBillingPartyAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBillingPartyAsync.fulfilled, (state, action) => {
        state.loading = false;
        billingPartyAdapter.addOne(state, action.payload);
      })
      .addCase(addBillingPartyAsync.rejected, (state) => {
        state.loading = false;
      });

    // Update
    builder
      .addCase(updateBillingPartyAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBillingPartyAsync.fulfilled, (state, action) => {
        state.loading = false;
        billingPartyAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })
      .addCase(updateBillingPartyAsync.rejected, (state) => {
        state.loading = false;
      });

    // Delete
    builder
      .addCase(deleteBillingPartyAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBillingPartyAsync.fulfilled, (state, action) => {
        state.loading = false;
        billingPartyAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteBillingPartyAsync.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const selectBillingPartyLoading = (state: RootState) =>
  state.billingParty.loading;

export const billingPartySelectors = billingPartyAdapter.getSelectors(
  (state: RootState) => state.billingParty
);

export default billingPartySlice.reducer;
