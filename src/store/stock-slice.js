import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";

const SubtractTimeUnit = (interval) => {
  let timeUnit = "";
  let intervalChar = interval.charAt(interval.length - 1);

  if (intervalChar === "m") {
    timeUnit = "hour";
  } else if (intervalChar === "h") {
    timeUnit = "day";
  } else if (
    intervalChar === "d" ||
    intervalChar === "k" ||
    intervalChar === "o"
  ) {
    timeUnit = "month";
  }

  return timeUnit;
};

const stockSlice = createSlice({
  name: "stock",
  initialState: {
    stockData: [],
    interval: "1d", // possible values: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
    startDate: moment().subtract(60, "month").toDate(),
    endDate: moment().valueOf(),
    rangeStartDate: moment().subtract(6, "month").toDate(), // assume interval = "1d"
    rangeEndDate: moment().toDate(),
    tradingPeriod: {
      regularStart: 0,
      regularEnd: 0,
    },
  },
  reducers: {
    setStockData(state, action) {
      state.stockData = action.payload;
    },
    setRangeDate(state, action) {
      const { rangeStartDate, rangeEndDate } = action.payload;
      // asume the dates are date object
      state.rangeStartDate = rangeStartDate;
      state.rangeEndDate = rangeEndDate;
    },
    setRangeStartDate(state, action) {
      state.rangeStartDate = action.payload;
    },
    setRangeEndDate(state, action) {
      state.rangeEndDate = action.payload;
    },
    setRangeOption(state, action) {
      const { subtractUnit, value } = action.payload;
      state.rangeStartDate = moment(state.tradingPeriod.regularEnd)
        .subtract(value, subtractUnit)
        .toDate();
    },
    setStartDateEndDate(state, action) {
      const interval = action.payload;
      const subtractUnit = SubtractTimeUnit(interval);
      let subtractValue = 0;
      let subtractRangeValue = 0;
      const intervalChar = interval.charAt(interval.length - 1);
      if (intervalChar === "d") {
        subtractValue = 60;
        subtractRangeValue = 6;
      } else if (intervalChar === "k") {
        subtractValue = 180;
        subtractRangeValue = 12;
      } else if (intervalChar === "o") {
        subtractValue = 180;
        subtractRangeValue = 60;
      } else if (intervalChar === "h") {
        subtractValue = 30;
        subtractRangeValue = 10;
      } else if (intervalChar === "m") {
        subtractValue = 48;
        subtractRangeValue = 4;
      }

      state.startDate = moment(state.tradingPeriod.regularEnd)
        .subtract(subtractValue, subtractUnit)
        .toDate();
      state.rangeStartDate = moment(state.tradingPeriod.regularEnd)
        .subtract(subtractRangeValue, subtractUnit)
        .toDate();

      state.rangeEndDate = moment(state.tradingPeriod.regularEnd).toDate();
      state.interval = interval;
    },
    setTradingPeriod(state, action) {
      const { regularStart, regularEnd } = action.payload;
      state.tradingPeriod = {
        regularStart,
        regularEnd,
      };

      state.startDate = moment(regularEnd).subtract(60, "month").toDate();
      state.endDate = moment(regularEnd).toDate();
      state.rangeStartDate = moment(regularEnd).subtract(6, "month").toDate(); // assume interval = "1d"
      state.rangeEndDate = moment(regularEnd).toDate();

      // startDate: moment().subtract(60, "month").toDate(),
      // endDate: moment().valueOf(),
      // rangeStartDate: moment().subtract(3, "month").toDate(), // assume interval = "1d"
      // rangeEndDate: moment().toDate(),
    },
    setLongestRange(state) {
      state.rangeStartDate = state.startDate;
      state.rangeEndDate = state.endDate;
    },
  },
});

export const stockActions = stockSlice.actions;

export default stockSlice;
