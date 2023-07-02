import { configureStore } from "@reduxjs/toolkit";

import indicatorSlice from "./indicator-slice";
import drawingSlice from "./drawing-slice";

const store = configureStore({
  reducer: {
    indicator: indicatorSlice.reducer,
    drawing: drawingSlice.reducer,
  },
});

export default store;
