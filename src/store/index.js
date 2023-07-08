import { configureStore } from "@reduxjs/toolkit";

import indicatorSlice from "./indicator-slice";
import drawingSlice from "./drawing-slice";
import stockSlice from "./stock-slice";

const store = configureStore({
  reducer: {
    indicator: indicatorSlice.reducer,
    drawing: drawingSlice.reducer,
    stock: stockSlice.reducer,
  },
});

export default store;
