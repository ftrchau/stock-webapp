import { createSlice } from "@reduxjs/toolkit";

const stockSlice = createSlice({
  name: "stock",
  initialState: {
    stockData: [],
  },
  reducers: {
    setStockData(state, action) {
      state.stockData = action.payload;
    },
  },
});

export const stockActions = stockSlice.actions;

export default stockSlice;
