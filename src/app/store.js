import { configureStore } from '@reduxjs/toolkit';
import divesReducer from '../features/slice/divesSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    dives: divesReducer,
    auth: authReducer,
  },
});


