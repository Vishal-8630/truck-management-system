import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type EntityId,
} from "@reduxjs/toolkit";
import type { VehicleEntryType } from "../../types/vehicleEntry";
import api from "../../api/axios";
import type { RootState } from "../../app/store";
import normalizedError from "../../utils/normalizedError";

/* --------------------- Adapter ----------------------- */
export const vehicleEntryAdapter = createEntityAdapter<
  VehicleEntryType,
  EntityId
>({
  selectId: (entry) => entry._id,
});

/* ----------------- Async Thunk ------------------------- */

// Fetch all vehicle entries
export const fetchVehicleEntriesAsync = createAsyncThunk<
  VehicleEntryType[],
  void,
  { rejectValue: string }
>("vehicleEntry/fetchAll", async (_, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.get("/vehicle-entry/all");
    return response.data.data as VehicleEntryType[];
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch vehicle entries");
  }
});

// Add a new vehicle entry
export const addVehicleEntryAsync = createAsyncThunk<
  VehicleEntryType,
  Omit<VehicleEntryType, "_id">,
  { rejectValue: Record<string, string> }
>("vehicleEntry/add", async (newVehicleEntry, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.post("/vehicle-entry/new", newVehicleEntry);
    return response.data.data as VehicleEntryType;
  } catch (err: any) {
    return rejectWithValue(
      normalizedError(err, "Failed to add new vehicle entry")
    );
  }
});

// Update a vehicle entry
export const updateVehicleEntryAsync = createAsyncThunk<
  VehicleEntryType,
  VehicleEntryType,
  { rejectValue: Record<string, string> }
>("vehicleEntry/update", async (updatedEntry, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.put(
      `/vehicle-entry/update/${updatedEntry._id}`,
      updatedEntry
    );
    return response.data.data as VehicleEntryType;
  } catch (err: any) {
    return rejectWithValue(
      normalizedError(err, "Failed to update vehicle entry")
    );
  }
});

// Delete a vehicle entry
export const deleteVehicleEntryAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("vehicleEntry/delete", async (_id, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    await api.delete(`/vehicle-entry/delete/${_id}`);
    return _id;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to delete billing party");
  }
});

const vehicleEntrySlice = createSlice({
  name: "vehicleEntry",
  initialState: vehicleEntryAdapter.getInitialState({
    loading: false,
  }),
  reducers: {},
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchVehicleEntriesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicleEntriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        vehicleEntryAdapter.setAll(state, action.payload);
      })
      .addCase(fetchVehicleEntriesAsync.rejected, (state) => {
        state.loading = false;
      });

    // Add
    builder
      .addCase(addVehicleEntryAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addVehicleEntryAsync.fulfilled, (state, action) => {
        state.loading = false;
        vehicleEntryAdapter.addOne(state, action.payload);
      })
      .addCase(addVehicleEntryAsync.rejected, (state) => {
        state.loading = false;
      });

    // Update
    builder
      .addCase(updateVehicleEntryAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateVehicleEntryAsync.fulfilled, (state, action) => {
        state.loading = false;
        vehicleEntryAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })
      .addCase(updateVehicleEntryAsync.rejected, (state) => {
        state.loading = false;
      });

    // Delete
    builder
      .addCase(deleteVehicleEntryAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteVehicleEntryAsync.fulfilled, (state, action) => {
        state.loading = false;
        vehicleEntryAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteVehicleEntryAsync.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const selectVehicleEntryLoading = (state: RootState) =>
  state.vehicleEntry.loading;

export const vehicleEntrySelectors = vehicleEntryAdapter.getSelectors(
  (state: RootState) => state.vehicleEntry
);

export default vehicleEntrySlice.reducer;
