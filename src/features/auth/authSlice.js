import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

export const userLogin = createAsyncThunk(
  'auth/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/user/log-in`, loginData, {
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      // Store token if included in response
      if (response.data.information?.jwtLoginToken) {
        localStorage.setItem("jwtLoginToken", response.data.information.jwtLoginToken);
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to login";
      return rejectWithValue({ 
        message, 
        statusCode: error.response?.status || 500 
      });
    }
  }
);

const initialState = {
  isAuthenticated: false,
  user: null,
  userRole: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.userRole = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem("jwtLoginToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.information?.user;
        state.userRole = action.payload.information?.user?.user_Access?.toLowerCase();
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Login failed";
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;