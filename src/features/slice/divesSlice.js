import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const initialState = {
  dives: [],
  status: 'idle',
};

export const fetchDives = createAsyncThunk('dives/fetchDives', async (userId) => {
  if (!userId) return [];
  const q = query(collection(db, 'dives'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const dives = [];
  querySnapshot.forEach((doc) => {
    dives.push({ id: doc.id, ...doc.data() });
  });
  return dives;
});

export const divesSlice = createSlice({
  name: 'dives',
  initialState,
  reducers: {
    clearDives(state) {
      state.dives = [];
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDives.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDives.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dives = action.payload;
      })
      .addCase(fetchDives.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { clearDives } = divesSlice.actions;
export const selectDives = (state) => state.dives.dives;
export const selectDivesStatus = (state) => state.dives.status;

export default divesSlice.reducer;
