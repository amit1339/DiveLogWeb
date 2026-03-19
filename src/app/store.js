import { configureStore } from '@reduxjs/toolkit';
import divesReducer from '../features/slice/divesSlice';

export const store = configureStore({
  reducer: {
    dives: divesReducer,
  },
});


