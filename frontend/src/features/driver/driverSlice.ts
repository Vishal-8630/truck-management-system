import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type EntityId,
} from "@reduxjs/toolkit";
import type { DriverType } from "../../types/driver";
import api from "../../api/axios";
import normalizedError from "../../utils/normalizedError";
import type { RootState } from "../../app/store";

export const driverAdapter = createEntityAdapter<DriverType, EntityId>({
  selectId: (entry) => entry._id,
});

// Fetch all drivers
export const fetchDriverEntriesAsync = createAsyncThunk<
  DriverType[],
  void,
  { rejectValue: string }
>("driver/fetchAll", async (_, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.get("/driver/all");
    return response.data.data as DriverType[];
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch driver entries");
  }
});

// Add a new driver
export const addDriverEntryAsync = createAsyncThunk<
  DriverType,
  Omit<DriverType, "_id">,
  { rejectValue: Record<string, string> }
>("driver/add", async (newDriver, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.post("/driver/all", newDriver);
    return response.data.data as DriverType;
  } catch (err: any) {
    return rejectWithValue(normalizedError(err, "Failed to add new driver"));
  }
});

// Update a driver
export const updateDriverEntryAsync = createAsyncThunk<
  DriverType,
  DriverType,
  { rejectValue: Record<string, string> }
>("driver/update", async (updateDriver, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.put(
      `/driver/update${updateDriver._id}`,
      updateDriver
    );
    return response.data.data as DriverType;
  } catch (err: any) {
    return rejectWithValue(
      normalizedError(err, "Failed to update vehicle entry")
    );
  }
});

// Delete a driver
export const deleteDriverEntryAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("driver/delete", async (_id, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    await api.delete(`/driver/delete/${_id}`);
    return _id;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to delete driver");
  }
});

const driverSlice = createSlice({
  name: "driver",
  initialState: driverAdapter.getInitialState({
    loading: false,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverEntriesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDriverEntriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        driverAdapter.setAll(state, action.payload);
      })
      .addCase(fetchDriverEntriesAsync.rejected, (state) => {
        state.loading = false;
      });

    // Add
    builder
      .addCase(addDriverEntryAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDriverEntryAsync.fulfilled, (state, action) => {
        state.loading = false;
        driverAdapter.addOne(state, action.payload);
      })
      .addCase(addDriverEntryAsync.rejected, (state) => {
        state.loading = false;
      });

    // Update
    builder
      .addCase(updateDriverEntryAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDriverEntryAsync.fulfilled, (state, action) => {
        state.loading = false;
        driverAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })
      .addCase(updateDriverEntryAsync.rejected, (state) => {
        state.loading = false;
      });

    // Delete
    builder
      .addCase(deleteDriverEntryAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDriverEntryAsync.fulfilled, (state, action) => {
        state.loading = false;
        driverAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteDriverEntryAsync.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const selectDriverLoading = (state: RootState) => state.driver.loading;

export const driverSelectors = driverAdapter.getSelectors(
  (state: RootState) => state.driver
);

export default driverSlice.reducer;