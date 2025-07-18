import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =import.meta.env.VITE_REACT_APP_API_URL;

const getAuthHeaders = () => {
  const jwtLoginToken = localStorage.getItem("jwtLoginToken");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtLoginToken}`
  };
};

// Thunks (with enhanced error handling)
export const admitPatient = createAsyncThunk(
  'ipdPatient/admitPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/admittedPatient/create-admitted-patient`,
        patientData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to admit patient';
      return rejectWithValue({ message, statusCode: error.response?.status || 500 });
    }
  }
);

export const getAllAdmittedPatients = createAsyncThunk(
  'ipdPatient/getAllAdmittedPatients',
  async (params = { page: 1, limit: 20 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/admittedPatient/get-admitted-patients`,
        { params, headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch admitted patients';
      return rejectWithValue({ message });
    }
  }
);

export const getIpdPatientByMrno = createAsyncThunk(
  'ipdPatient/getIpdPatientByMrno',
  async (mrno, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/admittedPatient/get-admitted-patient-by-mrno/${mrno}`,
        { headers: getAuthHeaders() }
      );
      return response.data.information.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient by MRNO');
    }
  }
);

export const getPatientByCnic = createAsyncThunk(
  'ipdPatient/getPatientByCnic',
  async (cnic, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/admittedPatient/get-by-cnic/${cnic}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient by CNIC');
    }
  }
);

export const deletePatient = createAsyncThunk(
  'ipdPatient/deletePatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/admittedPatient/delete-admission/${patientId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete patient');
    }
  }
);

export const updatePatientWard = createAsyncThunk(
  'ipdPatient/updatePatientWard',
  async ({ patientId, wardData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/admittedPatient/update-admission/${patientId}`,
        wardData,
        { headers: getAuthHeaders() }
      );
      return { 
        patientId,
        updatedPatient: response.data.data,  // Ensure you are using the correct field from response
        isDischarge: wardData.status === 'Discharged'
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update patient ward");
    }
  }
);


const initialState = {
  admissionData: null,
  patientsList: [],
  currentPatient: null,
  dischargedPatients: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20
  },
  isLoading: false,
  isError: false,
  error: null,
  status: {
    admit: 'idle',
    fetch: 'idle',
    search: 'idle',
    delete: 'idle',
    discharge: 'idle',
    update: 'idle'
  },
  statusHistory: []
};

const ipdPatientSlice = createSlice({
  name: 'ipdPatient',
  initialState,
  reducers: {
    resetAdmissionState: (state) => {
      state.admissionData = null;
      state.isError = false;
      state.error = null;
      state.status.admit = 'idle';
    },
    resetPatientState: (state) => {
      state.currentPatient = null;
      state.isError = false;
      state.error = null;
    },
    resetOperationStatus: (state, action) => {
      const operation = action.payload; // 'admit', 'fetch', 'discharge', etc.
      if (state.status[operation]) {
        state.status[operation] = 'idle';
      }
      state.isError = false;
      state.error = null;
    },
    clearCurrentPatient: (state) => {
      state.currentPatient = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Admit Patient
      .addCase(admitPatient.pending, (state) => {
        state.status.admit = 'pending';
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(admitPatient.fulfilled, (state, action) => {
        state.status.admit = 'succeeded';
        state.isLoading = false;
        state.admissionData = action.payload;  // Ensure the correct data is being stored
        state.patientsList.unshift(action.payload.data);  // Adding patient to the list
        state.statusHistory.push({
          action: 'admission',
          patientId: action.payload.data._id,
          timestamp: new Date().toISOString()
        });
      })
      
      .addCase(admitPatient.rejected, (state, action) => {
        state.status.admit = 'failed';
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })

      // Get All Admitted Patients
      .addCase(getAllAdmittedPatients.pending, (state) => {
        state.status.fetch = 'pending';
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(getAllAdmittedPatients.fulfilled, (state, action) => {
        state.status.fetch = 'succeeded';
        state.isLoading = false;
        state.patientsList = action.payload.data || [];
        state.pagination = {
          currentPage: action.payload.page || 1,
          totalPages: action.payload.pages || 1,
          totalItems: action.payload.total || 0,
          limit: action.payload.limit || 20
        };
      })
      .addCase(getAllAdmittedPatients.rejected, (state, action) => {
        state.status.fetch = 'failed';
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload.message;
      })

      // Get Patient by MRNO
      .addCase(getIpdPatientByMrno.pending, (state) => {
        state.status.search = 'pending';
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getIpdPatientByMrno.fulfilled, (state, action) => {
        state.status.search = 'succeeded';
        state.isLoading = false;
        state.data = action.payload.data || {}; // Ensure data is set properly
        state.currentPatient = action.payload;
      })
      .addCase(getIpdPatientByMrno.rejected, (state, action) => {
        state.status.search = 'failed';
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload.message;
      })

      // Get Patient by CNIC
      .addCase(getPatientByCnic.pending, (state) => {
        state.status.search = 'pending';
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getPatientByCnic.fulfilled, (state, action) => {
        state.status.search = 'succeeded';
        state.isLoading = false;
        state.currentPatient = action.payload;
      })
      .addCase(getPatientByCnic.rejected, (state, action) => {
        state.status.search = 'failed';
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })

      // Delete Patient
      .addCase(deletePatient.pending, (state) => {
        state.status.delete = 'pending';
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.status.delete = 'succeeded';
        state.isLoading = false;
        state.patientsList = state.patientsList.filter(
          patient => patient._id !== action.meta.arg
        );
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.status.delete = 'failed';
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })

      
      // Update Patient Ward (handles both admission updates and discharge)
      .addCase(updatePatientWard.pending, (state) => {
        state.status.update = 'pending';
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(updatePatientWard.fulfilled, (state, action) => {
        state.status.update = 'succeeded';
        state.isLoading = false;
        const { patientId, updatedPatient, isDischarge } = action.payload;
      
        // Update the patient information in the patientsList
        if (isDischarge) {
          // Remove from admitted patients list and add to discharged patients list
          state.patientsList = state.patientsList.filter(
            patient => patient._id !== patientId
          );
          state.dischargedPatients.push(updatedPatient);
        } else {
          // Update the ward information for the admitted patient
          state.patientsList = state.patientsList.map(patient =>
            patient._id === patientId ? updatedPatient : patient
          );
        }
      
        // Add to status history
        state.statusHistory.push({
          action: isDischarge ? 'discharge' : 'wardUpdate',
          patientId,
          timestamp: new Date().toISOString(),
          newStatus: updatedPatient.status,
          wardInfo: updatedPatient.ward_Information
        });
      })
           
      .addCase(updatePatientWard.rejected, (state, action) => {
        state.status.update = 'failed';
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectAdmissionStatus = (state) => state.ipdPatient.status.admit;
export const selectFetchStatus = (state) => state.ipdPatient.status.fetch;
export const selectDischargeStatus = (state) => state.ipdPatient.status.discharge;
export const selectUpdateStatus = (state) => state.ipdPatient.status.update;
export const selectDeleteStatus = (state) => state.ipdPatient.status.delete;
export const selectSearchStatus = (state) => state.ipdPatient.status.search;

// Actions
export const {
  resetAdmissionState,
  resetPatientState,
  resetOperationStatus,
  clearCurrentPatient
} = ipdPatientSlice.actions;

export default ipdPatientSlice.reducer; 