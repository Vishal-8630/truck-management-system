import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type EntityId,
} from "@reduxjs/toolkit";
import type { BalancePartyType } from "../../types/balanceParty";
import api from "../../api/axios";
import type { RootState } from "../../app/store";
import normalizedError from "../../utils/normalizedError";

// -------------------- Adapter -------------------
const balancePartyAdapter = createEntityAdapter<BalancePartyType, EntityId>({
  selectId: (party) => party._id,
});

// ------------------- Async Thunks --------------------

// Fetch all balance parties
export const fetchBalanceParties = createAsyncThunk<
  BalancePartyType[],
  void,
  { rejectValue: string }
>("balanceParty/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/balance-party/all");
    return response.data.data as BalancePartyType[];
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch balance parties");
  }
});

// Add a new balance party
export const addBalancePartyAsync = createAsyncThunk<
  BalancePartyType,
  Omit<BalancePartyType, "_id">,
  { rejectValue: Record<string, string> }
>("balanceParty/add", async (newParty, { rejectWithValue }) => {
  try {
    const response = await api.post(
      "/balance-party/new",
      newParty
    );
    return response.data.data as BalancePartyType;
  } catch (err: any) {
    return rejectWithValue(normalizedError(err, "Failed to add balance party"));
  }
});

// Update an existing balance party
export const updateBalancePartyAsync = createAsyncThunk<
  BalancePartyType,
  BalancePartyType,
  { rejectValue: Record<string, string> }
>("balanceParty/update", async (updatedParty, { rejectWithValue }) => {
  try {
    const response = await api.put(
      `/balance-party/update/${updatedParty._id}`,
      updatedParty
    );
    return response.data.data as BalancePartyType;
  } catch (err: any) {
    return rejectWithValue(normalizedError(err, "Failed to update balance party"));
  }
});

// Delete a balance party
export const deleteBalancePartyAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("balanceParty/delete", async (_id, { rejectWithValue }) => {
  try {
    await api.delete(`/balance-party/${_id}`);
    return _id;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to delete balance party");
  }
});

// ------------------- Slice --------------------
interface BalancePartyState {
  loading: boolean;
}

const initialState = balancePartyAdapter.getInitialState<BalancePartyState>({
  loading: false,
});

const balancePartySlice = createSlice({
  name: "balanceParty",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchBalanceParties.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBalanceParties.fulfilled, (state, action) => {
        state.loading = false;
        balancePartyAdapter.setAll(state, action.payload);
      })
      .addCase(fetchBalanceParties.rejected, (state) => {
        state.loading = false;
      });

    // Add
    builder
      .addCase(addBalancePartyAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBalancePartyAsync.fulfilled, (state, action) => {
        state.loading = false;
        balancePartyAdapter.addOne(state, action.payload);
      })
      .addCase(addBalancePartyAsync.rejected, (state) => {
        state.loading = false;
      });

    // Update
    builder
      .addCase(updateBalancePartyAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBalancePartyAsync.fulfilled, (state, action) => {
        state.loading = false;
        balancePartyAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })
      .addCase(updateBalancePartyAsync.rejected, (state) => {
        state.loading = false;
      });

    // Delete
    builder
      .addCase(deleteBalancePartyAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBalancePartyAsync.fulfilled, (state, action) => {
        state.loading = false;
        balancePartyAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteBalancePartyAsync.rejected, (state) => {
        state.loading = false;
      });
  },
});

// ------------------- Selectors --------------------
export const selectBalancePartyLoading = (state: RootState) =>
  state.balanceParty.loading;

export const balancePartySelectors = balancePartyAdapter.getSelectors(
  (state: RootState) => state.balanceParty
);

export default balancePartySlice.reducer;