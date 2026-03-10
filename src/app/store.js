import { configureStore } from '@reduxjs/toolkit';
import divesReducer from '../features/dives/divesSlice';

export const store = configureStore({
  reducer: {
    dives: divesReducer,
  },
});


