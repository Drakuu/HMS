// src/features/tests/testSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL; 


const getAuthHeaders = () => {
  const jwtLoginToken = localStorage.getItem("jwtLoginToken");
  return {
    headers: {
      Authorization: `Bearer ${jwtLoginToken}`,
    },
  };
};

// Async thunk to create a test
export const createTest = createAsyncThunk(
  'testManagement/createtest',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/testManagement/createtest`, payload, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Something went wrong'
      );
    }
  }
);

// Async thunk to get all tests
export const getAllTests = createAsyncThunk(
  'testManagement/getAllTests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/testManagement/getAlltest`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Something went wrong'
      );
    }
  }
);

// Async thunk to get a test by ID
export const getTestById = createAsyncThunk(
  'testManagement/getTestById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/testManagement/gettestbyId/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Something went wrong'
      );
    }
  }
);

// Async thunk to update a test
export const updateTest = createAsyncThunk(
  'testManagement/updateTest',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/testManagement/updateTest/${id}`, payload, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Something went wrong'
      );
    }
  }
);

// Async thunk to delete a test
export const deleteTest = createAsyncThunk(
  'testManagement/deleteTest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/testManagement/deleteTest/${id}`, getAuthHeaders());
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Something went wrong'
      );
    }
  }
);

// Slice
const testSlice = createSlice({
  name: 'tests',
  initialState: {
    loading: false,
    error: null,
    successMessage: '',
    createdTest: null,
    tests: [], // all lab tests
    selectedTest: null, // single test details
    getAllLoading: false,
    getAllError: null,
    getByIdLoading: false,
    getByIdError: null,
    updateLoading: false,
    updateError: null,
    deleteLoading: false,
    deleteError: null,
    deleteSuccess: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createTest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = '';
      })
      .addCase(createTest.fulfilled, (state, action) => {
        state.loading = false;
        state.createdTest = action.payload.test;
        state.successMessage = action.payload.message;
      })
      .addCase(createTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all tests
      .addCase(getAllTests.pending, (state) => {
        state.getAllLoading = true;
        state.getAllError = null;
      })
      .addCase(getAllTests.fulfilled, (state, action) => {
        state.getAllLoading = false;
        state.tests = Array.isArray(action.payload) ? action.payload : action.payload.tests || [];
      })
      .addCase(getAllTests.rejected, (state, action) => {
        state.getAllLoading = false;
        state.getAllError = action.payload;
      })
      // Get test by ID
      .addCase(getTestById.pending, (state) => {
        state.getByIdLoading = true;
        state.getByIdError = null;
        state.selectedTest = null;
      })
      .addCase(getTestById.fulfilled, (state, action) => {
        state.getByIdLoading = false;
        state.selectedTest = action.payload;
      })
      .addCase(getTestById.rejected, (state, action) => {
        state.getByIdLoading = false;
        state.getByIdError = action.payload;
      })
      // Update test
      .addCase(updateTest.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.successMessage = '';
      })
      .addCase(updateTest.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.successMessage = action.payload.message;
        // Optionally update selectedTest or tests if needed
      })
      .addCase(updateTest.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Delete test
      .addCase(deleteTest.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = '';
      })
      .addCase(deleteTest.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = action.payload.message;
        state.tests = state.tests.filter(t => t._id !== action.payload.id);
      })
      .addCase(deleteTest.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export default testSlice.reducer;

// Selectors
export const selectAllTests = state => state.labtest.tests;
export const selectSelectedTest = state => state.labtest.selectedTest;
export const selectGetAllLoading = state => state.labtest.getAllLoading;
export const selectGetByIdLoading = state => state.labtest.getByIdLoading;
export const selectUpdateLoading = state => state.labtest.updateLoading;
export const selectDeleteLoading = state => state.labtest.deleteLoading;
export const selectGetAllError = state => state.labtest.getAllError;
export const selectGetByIdError = state => state.labtest.getByIdError;
export const selectUpdateError = state => state.labtest.updateError;
export const selectDeleteError = state => state.labtest.deleteError;
export const selectDeleteSuccess = state => state.labtest.deleteSuccess;
