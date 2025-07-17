// features/auth/authSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ loginId, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/user/log-in`, {
        loginId,
        password,
      });
      // console.log('API Response:', response);

      // Destructure only if the data is available
     if (response.data && response.data.data) {
  const { token, user } = response.data.data;
  // console.log('Received token:', token);  // Log the token

  // Ensure user object exists
  if (!user || !user.user_Access) {
    return rejectWithValue('Invalid user data received');
  }

  // Trim the token to remove any unexpected characters
  const trimmedToken = token.trim();

  if (typeof trimmedToken !== 'string' || trimmedToken.length === 0) {
    return rejectWithValue('Invalid token format');
  }

  const decodedToken = jwtDecode(trimmedToken);

  return {
    token: trimmedToken,
    user: {
      ...user,
      exp: decodedToken.exp,
    },
  };
} else {
  return rejectWithValue('Invalid response structure from API');
}
    } catch (error) {
      console.error('Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // You might want to call a logout API here if needed
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    status: 'idle',
    error: null,
  },
  reducers: {
    initializeAuth(state) {
      state.token = localStorage.getItem('token') || null;
      state.user = JSON.parse(localStorage.getItem('user')) || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;

        // Store in localStorage
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.status = 'idle';
        state.error = null;

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  },
});

export const { initializeAuth } = authSlice.actions;

export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;