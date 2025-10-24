import { createAsyncThunk, createEntityAdapter, createSlice, type EntityId } from "@reduxjs/toolkit";
import type { TruckType } from "../../types/truck";
import api from "../../api/axios";
import type { RootState } from "../../app/store";

export const truckAdapter = createEntityAdapter<TruckType, EntityId>({
    selectId: (entry) => entry._id
});

// Fetch all trucks
export const fetchTrucksEntriesAsync = createAsyncThunk<
    TruckType[],
    void,
    { rejectValue: string }
>("truck/fetchAll", async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const response = await api.get("/truck/all");
        return response.data.data as TruckType[];
    } catch (err: any) {
        return rejectWithValue(err.message || "Failed to fetch trucks");
    }
});

// Add a new truck
export const addTruckEntryAsync = createAsyncThunk<
    TruckType,
    FormData,
    { rejectValue: string }
>("truck/add", async (newTruck, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const response = await api.post("/truck/new", newTruck, {
            headers: {
                'Content-Type': "multipart/form-data"
            }
        });
        return response.data.data as TruckType;
    } catch (err: any) {
        const errMsg = err.response?.data?.message || "Failed to add truck";
        return rejectWithValue(errMsg);
    }
});

// Update a truck
export const updateTruckEntryAsync = createAsyncThunk<
    TruckType,
    TruckType,
    { rejectValue: Record<string, string> }
>("truck/update", async (updateTruck, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const response = await api.put(`/truck/update${updateTruck._id}`, updateTruck);
        return response.data.data as TruckType;
    } catch (err: any) {
        return rejectWithValue(err.message || "Failed to update truck");
    }
});

// Delete a truck
export const deleteTruckEntryAsync = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("truck/delete", async (_id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        await api.delete(`/truck/delete/${_id}`);
        return _id;
    } catch (err: any) {
        return rejectWithValue(err.message || "Failed to delete truck");
    }
});

const truckSlice = createSlice({
    name: "truck",
    initialState: truckAdapter.getInitialState({
        loading: false,
    }),
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTrucksEntriesAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTrucksEntriesAsync.fulfilled, (state, action) => {
                state.loading = false;
                truckAdapter.setAll(state, action.payload);
            })
            .addCase(fetchTrucksEntriesAsync.rejected, (state) => {
                state.loading = false;
            });
        
        // Add
        builder
            .addCase(addTruckEntryAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(addTruckEntryAsync.fulfilled, (state, action) => {
                state.loading = false;
                truckAdapter.addOne(state, action.payload);
            })
            .addCase(addTruckEntryAsync.rejected, (state) => {
                state.loading = false;
            });
        
        // Update
        builder
            .addCase(updateTruckEntryAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateTruckEntryAsync.fulfilled, (state, action) => {
                state.loading = false;
                truckAdapter.updateOne(state, {
                    id: action.payload._id,
                    changes: action.payload
                });
            })
            .addCase(updateTruckEntryAsync.rejected, (state) => {
                state.loading = false;
            });
        
        // Delete
        builder
            .addCase(deleteTruckEntryAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteTruckEntryAsync.fulfilled, (state, action) => {
                state.loading = false;
                truckAdapter.removeOne(state, action.payload);
            })
            .addCase(deleteTruckEntryAsync.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const selectTruckLoading = (state: RootState) => state.truck.loading;

export const truckSelectors = truckAdapter.getSelectors(
    (state: RootState) => state.truck
);

export default truckSlice.reducer;