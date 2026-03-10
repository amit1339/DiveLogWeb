import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';




const initialState = {
  dives: [],
  status: 'idle',
};

export const fetchDives = createAsyncThunk('dives/fetchDives', async () => {
  const querySnapshot = await getDocs(collection(db, 'dives'));
  const dives = [];
  querySnapshot.forEach((doc) => {
    dives.push({ id: doc.id, ...doc.data() });
  });
  return dives;
});

export const divesSlice = createSlice({
  name: 'dives',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDives.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDives.fulfilled, (state, action) => {
        state.status = 'idle';
        state.dives = action.payload;
      })
      .addCase(fetchDives.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const selectDives = (state) => state.dives.dives;
export const selectDivesStatus = (state) => state.dives.status;

export default divesSlice.reducer;
