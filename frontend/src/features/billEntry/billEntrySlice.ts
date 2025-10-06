import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type EntityId,
} from "@reduxjs/toolkit";
import type { BillEntryType } from "../../types/billEntry";
import api from "../../api/axios";
import type { RootState } from "../../app/store";

/* --------------- Adapter --------------- */
const billEntryAdapter = createEntityAdapter<BillEntryType, EntityId>({
  selectId: (entry) => entry._id,
});

/* -------------- Async Thunks ------------------ */

// Fetch all bill entries
export const fetchBillEntriesAsync = createAsyncThunk<
  BillEntryType[],
  void,
  { rejectValue: string }
>("billEntry/fetchAll", async (_, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.get("/bill-entry/all");
    return response.data.data as BillEntryType[];
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch bill entries");
  }
});

// New bill entry
export const addBillEntryAsync = createAsyncThunk<
  BillEntryType,
  Omit<BillEntryType, "_id">,
  { rejectValue: Record<string, string> }
>("billEntry/add", async (newBillEntry, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.post("/bill-entry/new", newBillEntry);
    return response.data.data as BillEntryType;
  } catch (err: any) {
    const errorData = err.response?.data?.errors;
    let normalized: Record<string, string> = {};
    if (errorData && typeof errorData === 'object') {
      normalized = errorData;
    } else {
      normalized = { general: err.message || "Failed to add bill entry" }
    }
    return rejectWithValue(normalized);
  }
});

// Update an existing bill entry
export const updateBillEntryAsync = createAsyncThunk<
  BillEntryType,
  BillEntryType,
  { rejectValue: Record<string, string> }
>("billEntry/update", async (updatedBillEntry, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.put(
      `/bill-entry/update/${updatedBillEntry._id}`,
      updatedBillEntry
    );
    return response.data.data as BillEntryType;
  } catch (err: any) {
    const errorData = err.response?.data?.errors;
    let normalized: Record<string, string> = {};
    if (errorData && typeof errorData === "object") {
      normalized = errorData;
    } else {
      normalized = { general: err.message || "Failed to update bill entry" }
    }
    return rejectWithValue(normalized);
  }
});

// Delete a bill entry
export const deleteBillEntryAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("billEntry/delete", async (_id, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    await api.delete(`/bill-entry/delete/${_id}`);
    return _id;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to delete bill entry");
  }
});

// search bill entries by parameters
export const searchBillEntriesByParamAsync = createAsyncThunk<
    BillEntryType[],
    Record<string, any>,
    { rejectValue: string }
>(
    "billEntry/searchByParam",
    async (params, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        console.log(params);
        try {
            const response = await api.post("/bill-entry/search/by-param", {params});
            return response.data.data as BillEntryType[];
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to search bill entries");
        }
    }
)

const billEntrySlice = createSlice({
  name: "billEntry",
  initialState: billEntryAdapter.getInitialState({
    loading: false,
  }),
  reducers: {},
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchBillEntriesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBillEntriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        billEntryAdapter.setAll(state, action.payload);
      })
      .addCase(fetchBillEntriesAsync.rejected, (state) => {
        state.loading = false;
      });

    // Add
    builder
      .addCase(addBillEntryAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBillEntryAsync.fulfilled, (state, action) => {
        state.loading = false;
        billEntryAdapter.addOne(state, action.payload);
      })
      .addCase(addBillEntryAsync.rejected, (state) => {
        state.loading = false;
      });

    // Update
    builder
      .addCase(updateBillEntryAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBillEntryAsync.fulfilled, (state, action) => {
        state.loading = false;
        billEntryAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })
      .addCase(updateBillEntryAsync.rejected, (state) => {
        state.loading = false;
      });

    // Delete
    builder
      .addCase(deleteBillEntryAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBillEntryAsync.fulfilled, (state, action) => {
        state.loading = false;
        billEntryAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteBillEntryAsync.rejected, (state) => {
        state.loading = false;
      });

    // Search by param
    builder
      .addCase(searchBillEntriesByParamAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchBillEntriesByParamAsync.fulfilled, (state, action) => {
        state.loading = false;
        billEntryAdapter.setAll(state, action.payload);
      })
      .addCase(searchBillEntriesByParamAsync.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const selectBillEntryLoading = (state: RootState) =>
  state.billEntry.loading;

export const billEntrySelectors = billEntryAdapter.getSelectors(
  (state: RootState) => state.billEntry
);

export default billEntrySlice.reducer;
