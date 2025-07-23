import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const getAuthHeaders = () => {
  const jwtLoginToken = localStorage.getItem("jwtLoginToken");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtLoginToken}`
  };
};
// Get all test bills with error handling
export const getAllTestBills = createAsyncThunk(
  'billing/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/labBills`, {
  headers: getAuthHeaders()
});
      // console.log('Fetched bills:', response.data.data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch bills';
      console.error(message);
      return rejectWithValue({ message, statusCode: error.response?.status || 500 });
    }
  }
);

// Get bill details by ID with error handling
export const getBillDetails = createAsyncThunk(
  'billing/getDetails',
  async (id, { rejectWithValue }) => {
    try {
      console.log(`Fetching bill with ID: ${id}`);
      const response = await axios.get(`${API_URL}/labBills/${id}`, { headers: getAuthHeaders() });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch bill details';
      console.error(message);
      return rejectWithValue({ message, statusCode: error.response?.status || 500 });
    }
  }
);

export const processRefund = createAsyncThunk(
  'billing/processRefund',
  async ({ patientId, refundData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/labBills/bill/refund-amount-by-lab/${patientId}`,
        refundData,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to process refund';
      console.error(message);
      return rejectWithValue({ message, statusCode: error.response?.status || 500 });
    }
  }
);

const initialState = {
  allBills: {
    data: [],  // Changed from 'bills' to 'data'
    pagination: {},
    summary: {},
    status: 'idle'
  },
  currentBill: {
    data: null,
    status: 'idle'
  },
  refund: {
    status: 'idle',
    lastRefund: null,
    error: null
  }

};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    resetCurrentBill: (state) => {
      state.currentBill = initialState.currentBill;
    },
    resetRefundStatus: (state) => {
      state.refund = initialState.refund;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTestBills.pending, (state) => {
        state.allBills.status = 'loading';
      })
      .addCase(getAllTestBills.fulfilled, (state, action) => {
        state.allBills.status = 'succeeded';
        state.allBills.data = action.payload.results;  // Store results in data
        state.allBills.pagination = action.payload.pagination;
        state.allBills.summary = action.payload.summary;
      })
      .addCase(getAllTestBills.rejected, (state) => {
        state.allBills.status = 'failed';
      })
      .addCase(getBillDetails.pending, (state) => {
        state.currentBill.status = 'loading';
      })
      .addCase(getBillDetails.fulfilled, (state, action) => {
        state.currentBill.status = 'succeeded';
        state.currentBill.bill = action.payload;
      })
      .addCase(getBillDetails.rejected, (state) => {
        state.currentBill.status = 'failed';
      })
      // Process Refund
      .addCase(processRefund.pending, (state) => {
        state.refund.status = 'loading';
        state.refund.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.refund.status = 'succeeded';
        state.refund.lastRefund = action.payload;
        // Update current bill if it's the same patient
        if (state.currentBill.data && state.currentBill.data._id === action.meta.arg.patientId) {
          state.currentBill.data.refunded = state.currentBill.data.refunded || [];
          state.currentBill.data.refunded.push(action.payload.refundRecord);
        }
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.refund.status = 'failed';
        state.refund.error = action.payload?.message || 'Failed to process refund';
      });
  }
});

export const { resetCurrentBill, resetRefundStatus  } = billingSlice.actions;
export default billingSlice.reducer;
