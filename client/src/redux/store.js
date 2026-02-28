import { configureStore } from '@reduxjs/toolkit';
import authReducer    from './slices/authSlice';
import userReducer    from './slices/userSlice';
import productReducer from './slices/productSlice';
import cartReducer    from './slices/cartSlice';
import orderReducer   from './slices/orderSlice';

const store = configureStore({
  reducer: {
    auth:     authReducer,
    user:     userReducer,
    products: productReducer,
    cart:     cartReducer,
    orders:   orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
