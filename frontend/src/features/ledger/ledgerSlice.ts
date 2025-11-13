import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type EntityId,
} from "@reduxjs/toolkit";
import { type LedgerType } from "../../types/ledger";
import api from "../../api/axios";
import type { RootState } from "../../app/store";

export const ledgerAdapter = createEntityAdapter<LedgerType, EntityId>({
  selectId: (entry) => entry._id,
});

export const fetchLedgerEntriesAsync = createAsyncThunk<
  LedgerType[],
  void,
  { rejectValue: string }
>("ledger/fetchAll", async (_, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.get("/ledger/all");
    return response.data.data as LedgerType[];
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch ledger entries");
  }
});

export const addLedgerEntryAsync = createAsyncThunk<
  LedgerType,
  Omit<LedgerType, "_id">,
  { rejectValue: Record<string, string> }
>("ledger/add", async (newLedger, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.post("/ledger/new", newLedger);
    return response.data.data as LedgerType;
  } catch (error: any) {
    const errorData = error.response?.data?.errors;
    let normalized: Record<string, string> = {};
    if (errorData && typeof errorData === "object") {
      normalized = errorData;
      normalized.general = "Please fill all the required fields";
    } else {
      normalized = {
        general: error.message || "Failed to add new ledger entry ",
      };
    }
    return rejectWithValue(normalized);
  }
});

const ledgerSlice = createSlice({
  name: "ledger",
  initialState: ledgerAdapter.getInitialState({
    loading: false,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLedgerEntriesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLedgerEntriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        ledgerAdapter.setAll(state, action.payload);
      })
      .addCase(fetchLedgerEntriesAsync.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addLedgerEntryAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addLedgerEntryAsync.fulfilled, (state, action) => {
        state.loading = false;
        ledgerAdapter.addOne(state, action.payload);
      })
      .addCase(addLedgerEntryAsync.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const selectLedgerLoading = (state: RootState) => state.ledger.loading;

export const ledgerSelectors = ledgerAdapter.getSelectors(
  (state: RootState) => state.ledger
);

export default ledgerSlice.reducer;
