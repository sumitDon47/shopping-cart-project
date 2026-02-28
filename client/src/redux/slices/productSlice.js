import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products:    [],
  product:     null,
  categories:  [],
  loading:     false,
  error:       null,
  page:        1,
  pages:       1,
  total:       0,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setLoading:    (state) => { state.loading = true; state.error = null; },
    setProducts:   (state, { payload }) => {
      state.loading  = false;
      state.products = payload.products;
      state.page     = payload.page;
      state.pages    = payload.pages;
      state.total    = payload.total;
    },
    setProduct:    (state, { payload }) => { state.loading = false; state.product = payload; },
    setCategories: (state, { payload }) => { state.categories = payload; },
    setError:      (state, { payload }) => { state.loading = false; state.error = payload; },
    clearProduct:  (state) => { state.product = null; },
    clearError:    (state) => { state.error = null; },
  },
});

export const {
  setLoading, setProducts, setProduct, setCategories,
  setError, clearProduct, clearError,
} = productSlice.actions;

export default productSlice.reducer;
