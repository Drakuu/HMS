import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =import.meta.env.VITE_REACT_APP_API_URL;

// Create Staff async action
export const createStaff = createAsyncThunk(
    "staff/createStaff",
    async (staffData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/staff/create-staff`, staffData);
            return response.data;  // Ensure the server is returning correct data
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Fetch Staff by ID async action
export const updateStaff = createAsyncThunk(
    "staff/updateStaff",
    async ({ id, staffData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/staff/get-updatestaff-by-id/${id}`, staffData);
            return response.data;  // Ensure the server returns the data in the correct format
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);


// Fetch Staff by ID async action
export const getStaffById = createAsyncThunk(
    "staff/getStaffById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/staff/get-staff-by-id/${id}`);
            return response.data; // Ensure the server returns the specific staff data
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);





// Fetch All Staff async action
export const getAllStaff = createAsyncThunk(
    "staff/getAllStaff",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/staff/getall-staff`);
            return response.data; // Ensure the server is returning the list of staff
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const staffSlice = createSlice({
    name: "staff",
    initialState: {
        staffList: [],  // Holds the list of staff data
        staffDetails: null,  // To store the specific staff details
        loading: false,
        error: null,
        successMessage: "",
    },
    extraReducers: (builder) => {
        builder
            // Handle createStaff actions
            .addCase(createStaff.pending, (state) => {
                state.loading = true;
            })
            .addCase(createStaff.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload.staff) {
                    state.staffList.push(action.payload.staff);  // Access the staff object correctly
                    state.successMessage = "Staff created successfully!";
                } else {
                    state.error = "Failed to create staff";
                }
            })
            .addCase(createStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload : "Error creating staff";
            })

            // Handle getAllStaff actions
            .addCase(getAllStaff.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllStaff.fulfilled, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload)) {
                    state.staffList = action.payload;  // Populate the staffList with fetched data
                } else {
                    state.error = "Invalid staff data format";
                }
            })
            .addCase(getAllStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload : "Error fetching staff";
            })

            // Handle updatestaffby id actions
            .addCase(updateStaff.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateStaff.fulfilled, (state, action) => {
                state.loading = false;
                const updatedStaff = action.payload; // This is the updated staff object returned by the backend
                const index = state.staffList.findIndex(staff => staff._id === updatedStaff._id); // Find the index of the staff to update
                if (index !== -1) {
                    state.staffList[index] = updatedStaff; // Update the staff in the list
                }
            })

            .addCase(updateStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload : "Error fetching update staff";
            })


            .addCase(getStaffById.pending, (state) => {
                state.loading = true;
            })
            .addCase(getStaffById.fulfilled, (state, action) => {
                state.loading = false;
                state.staffDetails = action.payload; // Store the specific staff details in the state
            })
            .addCase(getStaffById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload : "Error fetching staff by ID";
            })
    },
    
});

export default staffSlice.reducer;
