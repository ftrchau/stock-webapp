import { createSlice } from "@reduxjs/toolkit";

const drawingSlice = createSlice({
  name: "drawing",
  initialState: {
    drawingToolSelected: {},
    fontColor: "rgb(41, 98, 255)",
    fontSizeSelected: 14,
    fontWeight: "normal",
    fontStyle: "",
    fonthAlign: "",
    fontvAlign: "",
    strokeWidthSelected: { name: "1 px", value: 1 },
    strokeTypeSelected: { name: "solid", value: 6, group: "Stroke Type" },
    colorFill: "rgb(225, 190, 231)",
    colorStroke: "rgb(0, 0, 0)",
    markerTypeSelected: {},
    markerColorFill: "rgb(41, 98, 255)",
    markerColorStroke: "rgb(0, 0, 0)",
    markerStrokeTypeSelected: { name: "solid", value: 6, group: "Stroke Type" },
    markerSizeSelected: 14,
    showDrawToolBar: false,
  },
  reducers: {
    setDrawingToolSelected(state, action) {
      state.drawingToolSelected = action.payload;
    },
    setMarkerTypeSelected(state, action) {
      state.markerTypeSelected = action.payload;
    },
    toogleDrawToolBar(state, action) {
      state.showDrawToolBar = action.payload;
    },
    setColorFill(state, action) {
      state.colorFill = action.payload;
    },
    setColorStroke(state, action) {
      state.colorStroke = action.payload;
    },
    setStrokeWidthSelected(state, action) {
      state.strokeWidthSelected = action.payload;
    },
    setStrokeTypeSelected(state, action) {
      state.strokeTypeSelected = action.payload;
    },
    setMarkerColorStroke(state, action) {
      state.markerColorStroke = action.payload;
    },
    setMarkerColorFill(state, action) {
      state.markerColorFill = action.payload;
    },
    setMarkerSizeSelected(state, action) {
      state.markerSizeSelected = action.payload;
    },
    setMarkerStrokeTypeSelected(state, action) {
      state.markerStrokeTypeSelected = action.payload;
    },
    setFontSizeSelected(state, action) {
      state.fontSizeSelected = action.payload;
    },
    setFontColor(state, action) {
      state.fontColor = action.payload;
    },
    setFontWeight(state, action) {
      state.fontWeight = action.payload;
    },
    setFontStyle(state, action) {
      state.fontStyle = action.payload;
    },
    setFonthAlign(state, action) {
      state.fonthAlign = action.payload;
    },
    setFontvAlign(state, action) {
      state.fontvAlign = action.payload;
    },
  },
});

export const drawingActions = drawingSlice.actions;

export default drawingSlice;
