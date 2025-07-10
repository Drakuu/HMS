import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Async Thunks
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

export const getAllWards = createAsyncThunk(
    "ward/getAllWards",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/ward/get-all-ward`, {
                headers: getAuthHeaders()
            });
            return response.data; // Added return statement
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateWardById = createAsyncThunk(
    "ward/updateWardById",
    async ({ id, wardData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_URL}/ward/get-ward-by-id/${id}`,
                wardData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getwardsbydepartmentId = createAsyncThunk(
    "ward/getwardbydepartment",
    async (departmentId, { rejectWithValue }) => {
        console.log(departmentId)
        if (!departmentId) {
            return rejectWithValue("Department ID is missing");
        }
        try {
            const response = await axios.get(
                `${API_URL}/ward/get-all-wards-by-dept/${departmentId}`,
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
        allWards: [],
        wardsByDepartment: [],
        loading: false,
        error: null,
        createLoading: false,
        createError: null,
        fetchLoading: false,
        fetchError: null,
        updateLoading: false,
        updateError: null,
        successMessage: null
    },
    reducers: {
        clearWardState: (state) => {
            state.error = null;
            state.createError = null;
            state.fetchError = null;
            state.updateError = null;
            state.successMessage = null;
        },
        resetDepartmentWards: (state) => {
            state.wardsByDepartment = [];
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
                    state.allWards.push(action.payload.ward);
                    state.successMessage = action.payload.message;
                }
            })
            .addCase(createWard.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload;
            })

            // Get All Wards
            .addCase(getAllWards.pending, (state) => {
                state.fetchLoading = true;
                state.fetchError = null;
            })
            .addCase(getAllWards.fulfilled, (state, action) => {
                state.fetchLoading = false;
                state.allWards = action.payload?.wards || [];
            })
            .addCase(getAllWards.rejected, (state, action) => {
                state.fetchLoading = false;
                state.fetchError = action.payload;
            })

            // Update Ward
            .addCase(updateWardById.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateWardById.fulfilled, (state, action) => {
                state.updateLoading = false;
                const updatedWard = action.payload.ward;
                state.allWards = state.allWards.map(ward =>
                    ward._id === updatedWard._id ? updatedWard : ward
                );
                state.successMessage = action.payload.message;
            })
            .addCase(updateWardById.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            })

            // Get Wards by Department
                                .addCase(getwardsbydepartmentId.pending, (state) => {
                        state.departmentLoading = true;
                        state.departmentError = null;
                    })
                    .addCase(getwardsbydepartmentId.fulfilled, (state, action) => {
                        state.departmentLoading = false;
                        state.wardsByDepartment = action.payload || [];
                    })
                    .addCase(getwardsbydepartmentId.rejected, (state, action) => {
                        state.departmentLoading = false;
                        state.departmentError = action.payload;
                    });
    }
});

export const { clearWardState, resetDepartmentWards } = wardSlice.actions;
export default wardSlice.reducer;