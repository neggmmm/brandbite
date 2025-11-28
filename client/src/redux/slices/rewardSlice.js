import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const getAllRewards = createAsyncThunk(
  "reward/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/reward");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data.error);
    }
  }
);

const rejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

const fulfilled = (state, action) => {
  state.loading = false;
  state.reward = action.payload;
  state.items = action.payload?.items || [];
  state.totalPrice = action.payload?.totalPrice || 0;
  state.error = null;
};

const pending = (state) => {
  state.loading = true;
  state.error = null;
};

const rewardSlice = createSlice({
  name: "reward",
  initialState: {
    reward: null,
    items: [],
    totalPrice: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllRewards.pending,pending)
      .addCase(getAllRewards.fulfilled,fulfilled)
      .addCase(getAllRewards.rejected,rejected)
  },
});

export default rewardSlice.reducer;