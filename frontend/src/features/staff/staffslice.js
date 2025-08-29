import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;



// Create Staff async action
export const createStaff = createAsyncThunk(
  "staff/createStaff",
  async (staffData, { rejectWithValue }) => {
    try {
      console.log("the staff data is ", staffData)
      const response = await axios.post(`${API_URL}/staff/create-staff`, staffData);
      console.log('the response data ', response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch All Staff async action
export const getAllStaff = createAsyncThunk(
  "staff/getAllStaff",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/staff/getall-staff`);
      // console.log("the staffs are ", response.data.data)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch Staff by ID async action
export const getStaffById = createAsyncThunk(
  "staff/getStaffById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/staff/get-staff-by-id/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Update Staff async action
export const updateStaff = createAsyncThunk(
  "staff/updateStaff",
  async ({ id, staffData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/staff/update-staff-by-id/${id}`, staffData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Soft Delete Staff async action
export const softDeleteStaff = createAsyncThunk(
  "staff/softDeleteStaff",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/staff/soft-delete-staff/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Restore Staff async action
export const restoreStaff = createAsyncThunk(
  "staff/restoreStaff",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/staff/restore-staff/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Get Deleted Staff async action
export const getDeletedStaff = createAsyncThunk(
  "staff/getDeletedStaff",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/staff/get-deleted-staff`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const staffSlice = createSlice({
  name: "staff",
  initialState: {
    staffList: [],
    deletedStaffList: [],
    staffDetails: null,
    loading: false,
    error: null,
    successMessage: "",
  },
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = "";
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Staff
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data && action.payload.data.staff) {
          state.staffList.push(action.payload.data.staff);
          state.successMessage = "Staff created successfully!";
        } else {
          state.error = "Failed to create staff";
        }
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload : "Error creating staff";
      })

      // Get All Staff
      .addCase(getAllStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllStaff.fulfilled, (state, action) => {
        state.loading = false;
          state.staffList = action.payload;
      })
      .addCase(getAllStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload : "Error fetching staff";
      })

      // Get Staff By ID
      .addCase(getStaffById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStaffById.fulfilled, (state, action) => {
        state.loading = false;
        state.staffDetails = action.payload.data;
      })
      .addCase(getStaffById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload : "Error fetching staff by ID";
      })

      // Update Staff
      .addCase(updateStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.loading = false;
        const updatedStaff = action.payload.data;
        const index = state.staffList.findIndex(staff => staff._id === updatedStaff._id);
        if (index !== -1) {
          state.staffList[index] = updatedStaff;
        }
        state.successMessage = "Staff updated successfully!";
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload : "Error updating staff";
      })

      // Soft Delete Staff
      .addCase(softDeleteStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(softDeleteStaff.fulfilled, (state, action) => {
        state.loading = false;
        const deletedStaffId = action.payload.data?._id;
        state.staffList = state.staffList.filter(staff => staff._id !== deletedStaffId);
        state.successMessage = "Staff deleted successfully!";
      })
      .addCase(softDeleteStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload : "Error deleting staff";
      })

      // Restore Staff
      .addCase(restoreStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreStaff.fulfilled, (state, action) => {
        state.loading = false;
        const restoredStaff = action.payload.data;
        state.deletedStaffList = state.deletedStaffList.filter(staff => staff._id !== restoredStaff._id);
        state.successMessage = "Staff restored successfully!";
      })
      .addCase(restoreStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload : "Error restoring staff";
      })

      // Get Deleted Staff
      .addCase(getDeletedStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDeletedStaff.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload.data)) {
          state.deletedStaffList = action.payload.data;
        } else {
          state.error = "Invalid deleted staff data format";
        }
      })
      .addCase(getDeletedStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload : "Error fetching deleted staff";
      });
  },
});

export const { clearSuccessMessage, clearError } = staffSlice.actions;
export default staffSlice.reducer;