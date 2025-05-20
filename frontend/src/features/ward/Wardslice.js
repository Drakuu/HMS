import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

// Helper function for auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Create Ward
export const createWard = createAsyncThunk(
    "ward/createWard",
    async (wardData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/ward/add-ward`, wardData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get All Wards
export const getAllWards = createAsyncThunk(
    "ward/getAllWards",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/ward/get-all-ward`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update Ward by ID
export const updateWardById = createAsyncThunk(
    "ward/updateWardById",
    async ({ id, wardData }, { rejectWithValue }) => {
        try {
            console.log(id)
            // Updated URL to the correct endpoint for updating the ward
            const response = await axios.put(
                `${API_URL}/ward/get-ward-by-id/${id}`,  // Make sure this is the correct URL
                wardData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);



const wardSlice = createSlice({
    name: "ward",
    initialState: {
        wardList: [],
        loading: false,
        error: null,
        createLoading: false,
        createError: null,
        updateLoading: false,
        updateError: null,
        deleteLoading: false,
        deleteError: null,
        successMessage: null
    },
    reducers: {
        clearWardState: (state) => {
            state.error = null;
            state.createError = null;
            state.updateError = null;
            state.deleteError = null;
            state.successMessage = null;
        },
        setCurrentWard: (state, action) => {
            state.currentWard = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Ward
            .addCase(createWard.pending, (state) => {
                state.createLoading = true;
                state.createError = null;
            })
            .addCase(createWard.fulfilled, (state, action) => {
                state.createLoading = false;
                if (action.payload?.ward) {
                    state.wardList.push(action.payload.ward);
                    state.successMessage = action.payload.message || "Ward created successfully!";
                }
            })
            .addCase(createWard.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload;
            })

            // Get All Wards
            .addCase(getAllWards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllWards.fulfilled, (state, action) => {
                state.loading = false;
                state.wardList = action.payload.data || action.payload.wards || [];
            })
            .addCase(getAllWards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Ward by ID
            .addCase(updateWardById.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateWardById.fulfilled, (state, action) => {
                state.updateLoading = false;
                const updatedWard = action.payload.ward || action.payload.data || action.payload;
                if (!updatedWard || !updatedWard._id) {
                    console.error("Updated ward data is invalid:", updatedWard);
                    return;
                }
                state.wardList = state.wardList.map(ward =>
                    ward._id === updatedWard._id ? updatedWard : ward
                );
                state.successMessage = action.payload.message || "Ward updated successfully!";
            })
            .addCase(updateWardById.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            })




    }
});

export const { clearWardState, setCurrentWard } = wardSlice.actions;
export default wardSlice.reducer;