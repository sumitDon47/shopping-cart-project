import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';

// Thunk – fetches the user's persisted cart from the server
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await cartAPI.get();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load cart');
    }
  }
);

const initialState = {
  items:      [],
  totalPrice: 0,
  totalItems: 0,
  loading:    false,
  error:      null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartLoading: (state) => { state.loading = true; state.error = null; },
    setCart:         (state, { payload }) => {
      state.loading    = false;
      state.items      = payload.items || [];
      state.totalPrice = payload.totalPrice || 0;
      state.totalItems = payload.totalItems || 0;
    },
    setCartError:   (state, { payload }) => { state.loading = false; state.error = payload; },
    clearCart:      (state) => {
      state.items = []; state.totalPrice = 0; state.totalItems = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending,  (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.loading    = false;
        state.items      = payload.items || [];
        state.totalPrice = payload.totalPrice || 0;
        state.totalItems = payload.totalItems || 0;
      })
      .addCase(fetchCart.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      });
  },
});

export const { setCartLoading, setCart, setCartError, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
