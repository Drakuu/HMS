import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

// 🔐 Get headers with token for auth
const getAuthHeaders = () => {
  const jwtLoginToken = localStorage.getItem("jwtLoginToken");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtLoginToken}`
  };
};

// ✅ Thunk: Submit Lab Test
export const SubmitPatientTest = createAsyncThunk(
  "patientTest/SubmitPatientTest",
  async (patientData, { rejectWithValue }) => {
    try {
      console.log("🧪 Data submitted:", patientData);

      const response = await axios.post(
        `${API_URL}/patientTest/patient-test`,
        patientData,
        { headers: getAuthHeaders() }
      );

      console.log("✅ Server Response:", response?.data?.data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to submit lab test';
      return rejectWithValue({ message, statusCode: error.response?.status || 500 });
    }
  }
);

// ✅ Thunk: Fetch Patient by MR No
export const fetchPatientByMRNo = createAsyncThunk(
  "patientTest/fetchPatientByMRNo",
  async (mrNo, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/patientTest/patient-test/${mrNo}`);
      console.log("📄 Patient fetched by MRNo:", response.data?.data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to fetch patient";
      return rejectWithValue({ message });
    }
  }
);

// 🔧 Initial State
const initialState = {
  patient: null,
  status: {
    submit: 'idle',
    fetch: 'idle',
  },
  isLoading: false,
  isError: false,
  error: null,
};

// 🧠 Slice
const patienttestSlice = createSlice({
  name: "patientTest",
  initialState,
  reducers: {
    resetPatientTestStatus: (state) => {
      state.status.submit = 'idle';
      state.status.fetch = 'idle';
      state.isError = false;
      state.error = null;
      state.patient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔁 Submit Lab Test
      .addCase(SubmitPatientTest.pending, (state) => {
        state.status.submit = 'pending';
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(SubmitPatientTest.fulfilled, (state, action) => {
        state.status.submit = 'succeeded';
        state.isLoading = false;
        state.patient = action.payload?.patient || action.payload;
      })
      .addCase(SubmitPatientTest.rejected, (state, action) => {
        state.status.submit = 'failed';
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload.message || 'Lab test submission failed';
      })

      // 🔁 Fetch Patient by MR No
      .addCase(fetchPatientByMRNo.pending, (state) => {
        state.status.fetch = 'pending';
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchPatientByMRNo.fulfilled, (state, action) => {
        state.status.fetch = 'succeeded';
        state.isLoading = false;
        state.patient = action.payload;
      })
      .addCase(fetchPatientByMRNo.rejected, (state, action) => {
        state.status.fetch = 'failed';
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload.message || 'Failed to fetch patient';
      });
  }
});

export const { resetPatientTestStatus } = patienttestSlice.actions;
export default patienttestSlice.reducer;
