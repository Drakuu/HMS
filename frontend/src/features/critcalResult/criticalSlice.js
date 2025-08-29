import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const getAuthHeaders = () => {
  const jwtLoginToken = localStorage.getItem("jwtLoginToken");
  if (jwtLoginToken) {
    try {
      jwtDecode(jwtLoginToken);
    } catch (error) {
      console.error("Invalid JWT token:", error.message);
    }
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwtLoginToken}`,
  };
};

export const createCriticalResult = createAsyncThunk(
  "criticalResult/createCriticalResult",
  async (criticalResultData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/criticalResult/create-Critical-result`,
        criticalResultData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create critical result"
      );
    }
  }
);

export const fetchCriticalResults = createAsyncThunk(
  "criticalResult/fetchCriticalResults",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/criticalResult/getAll-Critical-result`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch critical results"
      );
    }
  }
);

export const fetchCriticalResultById = createAsyncThunk(
  "criticalResult/fetchCriticalResultById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/criticalResult/get-Critical-result/${id}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch critical result"
      );
    }
  }
);

export const updateCriticalResult = createAsyncThunk(
  "criticalResult/updateCriticalResult",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/criticalResult/update-Critical-result/${id}`,
        data,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update critical result"
      );
    }
  }
);

export const deleteCriticalResult = createAsyncThunk(
  "criticalResult/deleteCriticalResult",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/criticalResult/delete-Critical-result/${id}`,
        { headers: getAuthHeaders() }
      );
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete critical result"
      );
    }
  }
);

const criticalResultSlice = createSlice({
  name: "criticalResult",
  initialState: {
    criticalResults: [],
    currentCriticalResult: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentCriticalResult: (state, action) => {
      state.currentCriticalResult = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Critical Result
      .addCase(createCriticalResult.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCriticalResult.fulfilled, (state, action) => {
        state.loading = false;
        state.criticalResults.unshift(action.payload.data);
        state.success = true;
      })
      .addCase(createCriticalResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All Critical Results
      .addCase(fetchCriticalResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCriticalResults.fulfilled, (state, action) => {
        state.loading = false;
        state.criticalResults = action.payload.data;
      })
      .addCase(fetchCriticalResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Critical Result By ID
      .addCase(fetchCriticalResultById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCriticalResultById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCriticalResult = action.payload.data;
      })
      .addCase(fetchCriticalResultById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Critical Result
      .addCase(updateCriticalResult.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCriticalResult.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.criticalResults.findIndex(
          (result) => result._id === action.payload.data._id
        );
        if (index !== -1) {
          state.criticalResults[index] = action.payload.data;
        }
        state.currentCriticalResult = action.payload.data;
        state.success = true;
      })
      .addCase(updateCriticalResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Critical Result
      .addCase(deleteCriticalResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCriticalResult.fulfilled, (state, action) => {
        state.loading = false;
        state.criticalResults = state.criticalResults.filter(
          (result) => result._id !== action.payload
        );
      })
      .addCase(deleteCriticalResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, setCurrentCriticalResult } =
  criticalResultSlice.actions;

export default criticalResultSlice.reducer;