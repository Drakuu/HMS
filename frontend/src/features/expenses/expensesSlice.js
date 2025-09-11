import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;


// Async thunks
export const createExpense = createAsyncThunk(
  'expenses/create-expense',
  async (expenseData, { rejectWithValue }) => {
    try {
      // Try a different endpoint that might exist
      const response = await axios.post(
        `${API_URL}/expense/create-expense`,
        expenseData,

        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.expenseData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to create expense. Please check if the server is running.'
      );
    }
  }
);

export const getExpenses = createAsyncThunk(
  'expenses/get-expenses',
  async (params = {}, { rejectWithValue }) => {
    console.log("Fetching expenses with params:", params);
    try {
      const { page = 1, limit = 10, doctor } = params;
      const response = await axios.get(`${API_URL}/expense/get-expenses`, {
        params: { page, limit, doctor },

      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getExpenseById = createAsyncThunk(
  'expenses/getExpenseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/expense/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, expenseData }, { rejectWithValue }) => {

    try {
      const response = await axios.put(`${API_URL}/expense/${id}`, expenseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/expense/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getDoctorSummary = createAsyncThunk(
  'expense/summary/doctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/expense/summary/doctors`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getGrandTotals = createAsyncThunk(
  'expenses/getGrandTotals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/expenses/summary/totals');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getCompleteSummary = createAsyncThunk(
  'expenses/getCompleteSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/expenses/summary/complete');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  expenses: [],
  currentExpense: null,
  doctorSummary: [],
  grandTotals: {
    grandWelfare: 0,
    grandOT: 0,
    grandOther: 0,
    grandTotal: 0,
    totalEntries: 0,
    totalDoctors: 0
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null,
  success: false
};

// Expense slice
const expensesSlice = createSlice({
  name: 'expenses',
  initialState: {
    expenses: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
    pagination: {
      total: 0,
      pages: 0,
      limit: 10,
      page: 1
    }
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Create expense cases
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // FIXED: Check the correct structure based on your API response
        // Your API returns {success, message, data} not {expenseData}
        if (action.payload && action.payload.data) {
          state.expenses.unshift(action.payload.data);
          state.message = action.payload.message || 'Expense created successfully';
        } else {
          // Fallback: If API structure is different, use the payload directly
          state.expenses.unshift(action.payload);
          state.message = 'Expense created successfully';
        }
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get expenses cases
      .addCase(getExpenses.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // FIX: Check the actual structure of your API response
        // Option 1: If your API returns { success, message, data }
        if (action.payload.data) {
          state.expenses = action.payload.data;
        }
        // Option 2: If your API returns the expenses array directly
        else {
          state.expenses = action.payload;
        }

        state.pagination.total = state.expenses.length;
        state.pagination.pages = Math.ceil(state.pagination.total / state.pagination.limit);
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = expensesSlice.actions;
export default expensesSlice.reducer;