import { createSlice } from '@reduxjs/toolkit';

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
});

export const { setCartLoading, setCart, setCartError, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
