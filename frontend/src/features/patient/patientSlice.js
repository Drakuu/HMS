import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const getAuthHeaders = () => {
  const jwtLoginToken = localStorage.getItem("jwtLoginToken");
  return {
    headers: {
      Authorization: `Bearer ${jwtLoginToken}`,
    },
  };
};

export const fetchPatients = createAsyncThunk(
  "patients/fetchPatients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/patient/get-patients`,
        getAuthHeaders()
      );
      return response.data.information.patients;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  "patients/fetchById",
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/patient/get-patient-by-id/${patientId}`,
        getAuthHeaders()
      );
      return response.data.information.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createPatient = createAsyncThunk(
  "patients/createPatient",
  async (newPatient, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/patient/create-patient`,
        newPatient,
        getAuthHeaders()  // Get JWT token from localStorage
      );
      return response.data.information.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updatePatient = createAsyncThunk(
  "patients/updatePatient",
  async ({ mrNo, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/patient/update-patient/${mrNo}`,
        updatedData,
        getAuthHeaders()
      );
      return response.data.information.updatedPatient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchPatientByMrNo = createAsyncThunk(
  'patient/fetchByMrNo',
  async (patientMRNo, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/patient/get-patient-by-mrno/${patientMRNo}`,
        getAuthHeaders(),
      );

      return response.data?.information?.patient;

    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error.message || "Failed to fetch patient"
      );
    }
  }
);

export const deletePatient = createAsyncThunk(
  "patients/deletePatient",
  async (patientId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/patient/delete-patient/${patientId}`,
        getAuthHeaders()
      );
      return patientId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const patientSlice = createSlice({
  name: "patients",
  initialState: {
    patients: [],
    selectedPatient: null,
    status: "idle",
    selectedPatientStatus: "idle",
    error: null,
  },
  reducers: {
    clearSelectedPatient: (state) => {
      state.selectedPatient = null;
      state.selectedPatientStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
    // Handle fetchPatients actions
      .addCase(fetchPatients.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Handle fetchPatientById actions
      .addCase(fetchPatientById.pending, (state) => {
        state.selectedPatientStatus = "loading";
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.selectedPatientStatus = "succeeded";
        state.selectedPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.selectedPatientStatus = "failed";
        state.error = action.payload;
      })
      // Handle createPatient actions
      .addCase(createPatient.fulfilled, (state, action) => {
        state.patients.push(action.payload);
      })
        // Handle createPatient actions
      .addCase(updatePatient.fulfilled, (state, action) => {
        const updatedPatient = action.payload;
        // Update patients list
        state.patients = state.patients.map(patient =>
          patient.patient_MRNo === updatedPatient.patient_MRNo ? updatedPatient : patient
        );
        // Update selected patient if it's the one being edited
        if (state.selectedPatient?.patient_MRNo === updatedPatient.patient_MRNo) {
          state.selectedPatient = updatedPatient;
        }
        state.status = 'succeeded';
      })
      // Handle updatePatient actions
      .addCase(updatePatient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Update failed';
      })
      // Handle deletePatient actions
      .addCase(deletePatient.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remove the deleted patient from the state
        state.patients = state.patients.filter(
          (patient) => patient._id !== action.payload
        );
        // Clear selected patient if it was the deleted one
        if (state.selectedPatient?._id === action.payload) {
          state.selectedPatient = null;
          state.selectedPatientStatus = "idle";
        }
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

const mrNumberSlice = createSlice({
  name: "mrNumber",
  initialState: {
    latestMrNo: "",
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientByMrNo.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(fetchPatientByMrNo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchPatientByMrNo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      });
  },
});

// Exports
export const { clearSelectedPatient } = patientSlice.actions;

export const selectPatients = (state) => state.patients.patients;
export const selectPatientStatus = (state) => state.patients.status;
export const selectSelectedPatient = (state) => state.patients.selectedPatient;
export const selectSelectedPatientStatus = (state) =>
  state.patients.selectedPatientStatus;
export const selectLatestMrNo = (state) => state.mrNumber.latestMrNo;
export const selectMrNoStatus = (state) => state.mrNumber.status;
export const selectMrNoError = (state) => state.mrNumber.error;

export const patientReducer = patientSlice.reducer;
export const mrNumberReducer = mrNumberSlice.reducer;