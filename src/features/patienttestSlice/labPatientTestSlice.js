import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const getAuthHeaders = () => {
  const jwtLoginToken = localStorage.getItem("jwtLoginToken");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtLoginToken}`
  };
};


export const SubmitLabTest = createAsyncThunk(
  "labTest/SubmitLabTest",
  async (patientData, { rejectWithValue }) => {
    try {
      console.log("THe dat ai receive is: ", patientData)

      const response = await axios.post(
        `${API_URL}/patientTest/add-patient-test`,
        patientData,
        { headers: getAuthHeaders() }
      );
      // return response.data.data;
      console.log("The response is",response)
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to submit lab test';
      return rejectWithValue({ message, statusCode: error.response?.status || 500 });
    }
  }
);


const initialState = {
  patient: null,
  status: {
    submit: 'idle',
  },
  isLoading: false,
  isError: false,
  error: null,
};

// ✅ Slice
const labTestSlice = createSlice({
  name: "labTest",
  initialState,
  reducers: {
    resetLabTestStatus: (state) => {
      state.status.submit = 'idle';
      state.isError = false;
      state.error = null;
      state.patient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(SubmitLabTest.pending, (state) => {
        state.status.submit = 'pending';
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(SubmitLabTest.fulfilled, (state, action) => {
        state.status.submit = 'succeeded';
        state.isLoading = false;
        state.patient = action.payload?.patient || action.payload;
      })
      .addCase(SubmitLabTest.rejected, (state, action) => {
        state.status.submit = 'failed';
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload.message || 'Lab test submission failed';
      });
  }
});


export default labTestSlice.reducer;
