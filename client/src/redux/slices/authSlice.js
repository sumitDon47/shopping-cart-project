import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user:            localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token:           localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading:         false,
  error:           null,
  registrationStep: 'send-otp', // ← ADD THIS LINE
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart:   (state) => { state.loading = true;  state.error = null; },
    loginSuccess: (state, { payload }) => {
      state.loading        = false;
      state.isAuthenticated = true;
      state.user           = payload.user;
      state.token          = payload.token;
      state.error          = null;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user',  JSON.stringify(payload.user));
    },
    loginFailure: (state, { payload }) => { state.loading = false; state.error = payload; },
    
    // ← ADD THIS ACTION
    setRegistrationStep: (state, { payload }) => {
      state.registrationStep = payload;
    },
    
    logout: (state) => {
      state.user = null; state.token = null;
      state.isAuthenticated = false; state.error = null;
      state.registrationStep = 'send-otp'; // ← ADD THIS LINE
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    clearError: (state) => { state.error = null; },
  },
});

// ← UPDATE THIS LINE TO EXPORT setRegistrationStep
export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  setRegistrationStep,  // ← ADD THIS
  logout, 
  updateUser, 
  clearError 
} = authSlice.actions;

export default authSlice.reducer;