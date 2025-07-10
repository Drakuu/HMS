import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

// Fetch appointments
export const fetchAppointments = createAsyncThunk('appointments/fetchAppointments', async (_, { getState }) => {
  const jwtLoginToken = localStorage.getItem('jwtLoginToken');
  const response = await axios.get(`${API_URL}/appointment/get-appointments`, {
    headers: {
      Authorization: `Bearer ${jwtLoginToken}`,
    },
  });
  return response.data;
});

// Create appointment
export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async ({ appointmentData, jwtLoginToken }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/appointment/create-appointment`,
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${jwtLoginToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        return rejectWithValue({ message: 'Network error - no response from server' });
      } else {
        return rejectWithValue({ message: error.message });
      }
    }
  }
);

// Delete appointment
export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (appointmentId, { getState }) => {
    const jwtLoginToken = localStorage.getItem('jwtLoginToken');
    const response = await axios.delete(`${API_URL}/appointment/delete-appointment/${appointmentId}`, {
      headers: {
        Authorization: `Bearer ${jwtLoginToken}`,
      },
    });
    return appointmentId;
  }
);

// Restore appointment
export const restoreAppointment = createAsyncThunk(
  'appointments/restoreAppointment',
  async (appointmentId, { getState }) => {
    const jwtLoginToken = localStorage.getItem('jwtLoginToken');
    const response = await axios.patch(`${API_URL}/appointment/restore-appointment/${appointmentId}`, {}, {
      headers: {
        Authorization: `Bearer ${jwtLoginToken}`,
      },
    });
    return response.data;
  }
);

// Update appointment
export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ appointmentId, updatedData }, { getState }) => {
    const jwtLoginToken = localStorage.getItem('jwtLoginToken');
    const response = await axios.patch(`${API_URL}/appointment/update-appointment/${appointmentId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${jwtLoginToken}`,
      },
    });
    return response.data;
  }
);

// Selectors
export const selectActiveAppointments = (state) => {
  // Check if appointments exist and are an array
  return Array.isArray(state.appointments.appointments)
    ? state.appointments.appointments.filter(appointment => !appointment.deleted)
    : [];
};

export const selectDeletedAppointments = (state) =>
  Array.isArray(state.appointments.appointments)
    ? state.appointments.appointments.filter(appointment => appointment.deleted)
    : [];

// Slice
const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [], // Ensure appointments are initialized as an empty array
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Ensure action.payload.information is an array before updating
        state.appointments = Array.isArray(action.payload.information)
          ? action.payload.information
          : [];
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // Create appointment
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointments.push(action.payload.information);
      })

      // Delete appointment - update state
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        const deletedId = action.payload;
        const index = state.appointments.findIndex(app => app._id === deletedId);
        if (index !== -1) {
          state.appointments[index].deleted = true;
        }
      })

      // Restore appointment - update state
      .addCase(restoreAppointment.fulfilled, (state, action) => {
        const restoredAppointment = action.payload.information;
        const index = state.appointments.findIndex(app => app._id === restoredAppointment._id);
        if (index !== -1) {
          state.appointments[index].deleted = false;
        }
      })

      // Update appointment - update state
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const updatedAppointment = action.payload.information;
        const index = state.appointments.findIndex(app => app._id === updatedAppointment._id);
        if (index !== -1) {
          state.appointments[index] = updatedAppointment;
        }
      });
  },
});

export default appointmentSlice.reducer;
