import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders:  [],
  order:   null,
  loading: false,
  error:   null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrderLoading: (state) => { state.loading = true; state.error = null; },
    setOrders:       (state, { payload }) => { state.loading = false; state.orders = payload; },
    setOrder:        (state, { payload }) => { state.loading = false; state.order = payload; },
    setOrderError:   (state, { payload }) => { state.loading = false; state.error = payload; },
    clearOrder:      (state) => { state.order = null; },
  },
});

export const { setOrderLoading, setOrders, setOrder, setOrderError, clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
