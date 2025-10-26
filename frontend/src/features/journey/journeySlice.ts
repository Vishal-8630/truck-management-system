import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type EntityId,
} from "@reduxjs/toolkit";
import { type JourneyType } from "../../types/journey";
import api from "../../api/axios";
import type { RootState } from "../../app/store";

export const journeyAdapter = createEntityAdapter<JourneyType, EntityId>({
  selectId: (entry) => entry._id,
});

// Fetch all journies
export const fetchJourneyEntriesAsync = createAsyncThunk<
  JourneyType[],
  void,
  { rejectValue: string }
>("journey/fetchAll", async (_, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.get("/journey/all");
    return response.data.data as JourneyType[];
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch truck journies");
  }
});

// Add new truck journey
export const addJourneyEntryAsync = createAsyncThunk<
  JourneyType,
  Omit<JourneyType, "_id">,
  { rejectValue: string }
>("journey/add", async (newJourney, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.post("/journey/new", newJourney);
    return response.data.data as JourneyType;
  } catch (error: any) {
    const errMsg =
      error.response?.data?.message || "Failed to add truck journey";
    return rejectWithValue(errMsg);
  }
});

// Update a journey
export const updateJourneyEntryAsync = createAsyncThunk<
  JourneyType,
  JourneyType,
  { rejectValue: Record<string, string> }
>("journey/update", async (updatedJourney, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await api.put(`/journey/update/${updatedJourney._id}`, updatedJourney);
    return response.data.data as JourneyType;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update truck journey");
  }
});

// Delete a journey
export const deleteJourneyEntryAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("journey/delete", async (_id, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    await api.delete(`/journey/delete/${_id}`);
    return _id;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete truck journey");
  }
});

const journeySlice = createSlice({
    name: "journey",
    initialState: journeyAdapter.getInitialState({
        loading: false,
    }),
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchJourneyEntriesAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchJourneyEntriesAsync.fulfilled, (state, action) => {
                state.loading = false;
                journeyAdapter.setAll(state, action.payload);
            })
            .addCase(fetchJourneyEntriesAsync.rejected, (state) => {
                state.loading = false;
            })

        // Add
        builder
            .addCase(addJourneyEntryAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(addJourneyEntryAsync.fulfilled, (state, action) => {
                state.loading = false;
                journeyAdapter.addOne(state, action.payload);
            })
            .addCase(addJourneyEntryAsync.rejected, (state) => {
                state.loading = false;
            })

        // Update
        builder
            .addCase(updateJourneyEntryAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateJourneyEntryAsync.fulfilled, (state, action) => {
                state.loading = false;
                journeyAdapter.updateOne(state, {
                    id: action.payload._id,
                    changes: action.payload
                });
            })
            .addCase(updateJourneyEntryAsync.rejected, (state) => {
                state.loading = false;
            })
        
        // Delete
        builder
            .addCase(deleteJourneyEntryAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteJourneyEntryAsync.fulfilled, (state, action) => {
                state.loading = false;
                journeyAdapter.removeOne(state, action.payload);
            })
            .addCase(deleteJourneyEntryAsync.rejected, (state) => {
                state.loading = false;
            })
    }
});

export const selectJourneyLoading = (state: RootState) => state.journey.loading;

export const journeySelectors = journeyAdapter.getSelectors(
    (state: RootState) => state.journey
);

export default journeySlice.reducer;