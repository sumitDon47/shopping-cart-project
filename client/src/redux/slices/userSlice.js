import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile:       null,
  loading:       false,
  error:         null,
  updateSuccess: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchProfileStart:   (state) => { state.loading = true;  state.error = null; },
    fetchProfileSuccess: (state, { payload }) => { state.loading = false; state.profile = payload; },
    fetchProfileFailure: (state, { payload }) => { state.loading = false; state.error = payload; },

    updateProfileStart:   (state) => { state.loading = true; state.error = null; state.updateSuccess = false; },
    updateProfileSuccess: (state, { payload }) => {
      state.loading = false; state.profile = payload; state.updateSuccess = true;
    },
    updateProfileFailure: (state, { payload }) => {
      state.loading = false; state.error = payload; state.updateSuccess = false;
    },

    clearUpdateSuccess: (state) => { state.updateSuccess = false; },
    clearError:         (state) => { state.error = null; },
  },
});

export const {
  fetchProfileStart, fetchProfileSuccess, fetchProfileFailure,
  updateProfileStart, updateProfileSuccess, updateProfileFailure,
  clearUpdateSuccess, clearError,
} = userSlice.actions;

export default userSlice.reducer;
