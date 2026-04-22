import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/proctoring/`;

export const startProctoringSession = createAsyncThunk(
  'proctoring/start',
  async (sessionId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(API_URL + 'start', { sessionId }, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logViolation = createAsyncThunk(
  'proctoring/logViolation',
  async (violationData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(API_URL + 'violation', violationData, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const endProctoringSession = createAsyncThunk(
  'proctoring/end',
  async (proctoringSessionId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(API_URL + 'end', { proctoringSessionId }, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  activeProctoringSession: null,
  riskScore: 0,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const proctoringSlice = createSlice({
  name: 'proctoring',
  initialState,
  reducers: {
    resetProctoring: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearProctoringSession: (state) => {
       state.activeProctoringSession = null;
       state.riskScore = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startProctoringSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(startProctoringSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activeProctoringSession = action.payload;
        state.riskScore = action.payload.riskScore;
      })
      .addCase(startProctoringSession.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(logViolation.fulfilled, (state, action) => {
        state.riskScore = action.payload.riskScore;
      })
      .addCase(endProctoringSession.fulfilled, (state, action) => {
        state.activeProctoringSession = null;
      });
  },
});

export const { resetProctoring, clearProctoringSession } = proctoringSlice.actions;
export default proctoringSlice.reducer;
