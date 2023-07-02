import { createSlice } from "@reduxjs/toolkit";

const indicatorSlice = createSlice({
  name: "indicator",
  initialState: {
    indicators: {
      "Traditional Indicator": [
        {
          name: "ALMA",
          value: "ALMA",
          groupIndex: 0,
          draw: false,
          apiFunc: "calculateStockALMA",
          parameters: [
            {
              name: "ALMAPeriodFast",
              label: "Fast ALMA Period",
              value: "5",
              type: "text",
            },
            {
              name: "ALMAPeriodLong",
              label: "Long ALMA Period",
              value: "20",
              type: "text",
            },
            {
              name: "ALMAPeriodTrend",
              label: "Trend ALMA Period",
              value: "70",
              type: "text",
            },
            {
              name: "offset",
              label: "ALMA Offset",
              value: "0.85",
              type: "text",
            },
            {
              name: "sigma",
              label: "ALMA Sigma",
              value: "6",
              type: "text",
            },
          ],
          charts: [
            {
              name: "ALMA Fast",
              column: "fastALMA",
              stroke: "2 rgb(255, 152, 0)",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
            },
            {
              name: "ALMA Slow",
              column: "longALMA",
              stroke: "2 rgb(33, 150, 243)",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
            },
            {
              name: "ALMA Trend",
              column: "trendALMA",
              stokre: "2 rgb(128, 128, 0)",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
            },
          ],
        },
        {
          name: "Bollinger Bands",
          value: "Bollinger Bands",
          groupIndex: 0,
          draw: false,
          apiFunc: "calculateBB",
          parameters: [
            {
              name: "period",
              label: "Period",
              value: "20",
              type: "text",
            },
            {
              name: "stdev",
              label: "Standard Deviation",
              value: "2",
              type: "text",
            },
          ],
          charts: [
            {
              name: "Bollinger Lower Bands",
              column: "bbands_lower",
              stroke: "2 rgb(41, 98, 255)",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
            },
            {
              name: "Bollinger Middle Bands",
              column: "bbands_middle",
              stroke: "2 rgb(255, 109, 0)",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
            },
            {
              name: "Bollinger Upper Bands",
              column: "bbands_upper",
              stroke: "2 rgb(41, 98, 255)",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
            },
          ],
        },
        {
          name: "MACD",
          value: "MACD",
          groupIndex: 0,
          draw: false,
          apiFunc: "calculateMACD",
          parameters: [
            {
              name: "short_period",
              label: "Fast Length",
              value: "12",
              type: "text",
            },
            {
              name: "long_period",
              label: "Slow Length",
              value: "26",
              type: "text",
            },
            {
              name: "source",
              label: "Source",
              value: "adjclose",
              type: "select-one",
              items: ["open", "high", "low", "close", "adjclose"],
            },
            {
              name: "signal_period",
              label: "Signal Smoothing",
              value: "9",
              type: "text",
            },
          ],
          charts: [
            {
              name: "MACD Signal",
              column: "macd_signal",
              plotIndexOffset: 1,
              index: -1,
              plotIndex: 0,
              seriesType: "line",
              stroke: "rgba(255, 106, 0, 1)",
            },
            {
              name: "MACD Histogram",
              column: "macd_histogram",
              seriesType: "column",
              result: [],
              plotIndexOffset: 1,
              plotIndex: 0,
              index: -1,
              // stroke: "rgba(38, 166, 154, 1)",
              stroke: [
                {
                  color: "rgb(38, 166, 154)",
                  conditions: ["positive", "increase"],
                },
                {
                  color: "rgb(255, 205, 210)",
                  conditions: ["negative", "increase"],
                },
                {
                  color: "rgb(178, 223, 219)",
                  conditions: ["positive", "decrease"],
                },
                {
                  color: "rgb(239, 83, 80)",
                  conditions: ["negative", "decrease"],
                },
              ],
            },
            {
              name: "MACD",
              column: "macd",
              seriesType: "line",
              plotIndexOffset: 1,
              plotIndex: 0,
              result: [],
              index: -1,
              stroke: [
                {
                  color: "rgba(83, 104, 120, 1)",
                  conditions: ["decrease"],
                },
                {
                  color: "rgba(0, 148, 255, 1)",
                  conditions: ["increase"],
                },
              ],
            },
          ],
        },
        {
          name: "OBV",
          value: "OBV",
          groupIndex: 0,
          draw: false,
          parameters: [],
          apiFunc: "calculateOBV",
          charts: [
            {
              name: "OBV",
              column: "obv",
              seriesType: "line",
              plotIndexOffset: 1,
              plotIndex: 0,
              index: -1,
              stroke: "2 rgb(41, 98, 255)",
            },
            {
              name: "Volume",
              column: "volume",
              seriesType: "column",
              plotIndexOffset: 2,
              plotIndex: 0,
              index: -1,
              stroke: [
                {
                  color: "rgb(0, 230, 118)",
                  conditions: ["increase"],
                },
                {
                  color: "rgb(247, 124, 128)",
                  conditions: ["decrease"],
                },
              ],
            },
          ],
        },
        {
          name: "RSI",
          value: "RSI",
          groupIndex: 0,
          draw: false,
          apiFunc: "calculateRSI",
          parameters: [
            {
              name: "period",
              label: "RSI Length",
              value: "14",
              type: "text",
            },
            {
              name: "source",
              label: "Source",
              value: "adjclose",
              type: "select-one",
              items: ["open", "high", "low", "close", "adjclose"],
            },
          ],
          charts: [
            {
              name: "RSI",
              column: "value",
              seriesType: "line",
              plotIndexOffset: 1,
              plotIndex: 0,
              index: -1,
              stroke: "2 rgb(126, 87, 194)",
            },
          ],
        },
        {
          name: "supertrend",
          value: "supertrend",
          groupIndex: 0,
          draw: false,
          apiFunc: "calculateStockSuperTrend",
          parameters: [
            {
              name: "atr_lookback",
              label: "Period",
              value: "14",
              type: "text",
            },
            {
              name: "multiplier",
              label: "Factor",
              value: "2",
              type: "text",
            },
          ],
          charts: [
            {
              name: "Simply Supertrend",
              column: "ST",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              result: [],
              stroke: [
                {
                  color: "2 rgb(76, 175, 80)",
                  conditions: [
                    function ($this, resultIndex, allResult) {
                      var condition = false;

                      // console.log(allResult[resultIndex]);

                      // allResult.reverse();
                      if (allResult[resultIndex]["ST_BUY_SELL"] === "BUY")
                        condition = true;
                      return condition;
                    },
                  ],
                },
                {
                  color: "2 rgb(255, 82, 82)",
                  conditions: [
                    function ($this, resultIndex, allResult) {
                      var condition = false;

                      // allResult.reverse();
                      if (allResult[resultIndex]["ST_BUY_SELL"] === "SELL")
                        condition = true;
                      return condition;
                    },
                  ],
                },
              ],
            },
          ],
          annotations: [
            {
              name: "supertrend buy label",
              type: "label",
              plotIndex: 0,
              annotationIndex: [],
              condition: {
                column: "BSIGNAL",
                value: "BUY",
              },
              parameters: {
                valueAnchor: "FLB",
                text: "BSIGNAL",
                fontColor: "#363A45",
              },
              background: {
                fill: "#00E676",
                stroke: "#00E676",
              },
            },
            {
              name: "supertrend sell label",
              type: "label",
              plotIndex: 0,
              annotationIndex: [],
              condition: {
                column: "SSIGNAL",
                value: "SELL",
              },
              parameters: {
                valueAnchor: "FUB",
                text: "SSIGNAL",
                fontColor: "#363A45",
              },
              background: {
                fill: "#FF5252",
                stroke: "#FF5252",
              },
            },
          ],
        },
      ],
      "Innovative Indicators": [
        {
          name: "ARIMA",
          value: "ARIMA",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateARIMA",
          parameters: [
            {
              name: "src",
              label: "Source",
              value: "adjclose",
              type: "select-one",
              items: ["open", "high", "low", "close", "adjclose"],
            },
            {
              name: "nar",
              label: "AR period, P",
              value: "1",
              type: "text",
            },
            {
              name: "ndd",
              label: "degree of difference, D",
              value: "1",
              type: "text",
            },
            {
              name: "nma",
              label: "MA period, Q",
              value: "5",
              type: "text",
            },
            {
              name: "pa",
              label: "AR factor period",
              value: "10",
              type: "text",
            },
            {
              name: "pb",
              label: "MA factor period",
              value: "10",
              type: "text",
            },
            {
              name: "len",
              label: "Length for RMSE",
              value: "100",
              type: "text",
            },
            {
              name: "Plot forecast line or dots",
              label: "Plot forecast line or dots",
              value: "dots",
              type: "select-one",
              items: ["dots", "line"],
            },
            {
              name: "Show RMSE?",
              label: "Show RMSE?",
              value: false,
              type: "checkbox",
            },
            {
              name: "Plot close line?",
              label: "Plot close line?",
              value: true,
              type: "checkbox",
            },
          ],
          seriesType: "line",
          charts: [
            {
              name: "source",
              column: "src",
              condition: {
                parameter: "Plot close line?",
                value: true,
              },
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              stroke: "rgb(76, 175, 80)",
            },
            {
              name: "forecast line",
              column: "Y",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              result: [],
              condition: {
                parameter: "Plot forecast line or dots",
                value: "line",
              },
              stroke: [
                {
                  color: "rgb(0, 230, 118)",
                  conditions: [
                    function ($this, resultIndex, allResult) {
                      var condition = false;

                      if (
                        allResult[resultIndex]["Y"] >
                        allResult[resultIndex]["src"]
                      )
                        condition = true;
                      return condition;
                    },
                  ],
                },
                {
                  color: "rgb(255, 152, 0)",
                  conditions: [
                    function ($this, resultIndex, allResult) {
                      var condition = false;

                      if (
                        allResult[resultIndex]["Y"] <
                        allResult[resultIndex]["src"]
                      )
                        condition = true;
                      return condition;
                    },
                  ],
                },
              ],
            },
            {
              name: "forecast dots",
              column: "Y",
              seriesType: "marker",
              plotIndexOffset: 0,
              size: 1,
              plotIndex: 0,
              index: -1,
              result: [],
              condition: {
                parameter: "Plot forecast line or dots",
                value: "dots",
              },
              stroke: [
                {
                  color: "rgb(0, 230, 118)",
                  conditions: [
                    function ($this, resultIndex, allResult) {
                      var condition = false;

                      if (
                        allResult[resultIndex]["Y"] >
                        allResult[resultIndex]["src"]
                      )
                        condition = true;
                      return condition;
                    },
                  ],
                },
                {
                  color: "rgb(255, 152, 0)",
                  conditions: [
                    function ($this, resultIndex, allResult) {
                      var condition = false;

                      if (
                        allResult[resultIndex]["Y"] <
                        allResult[resultIndex]["src"]
                      )
                        condition = true;
                      return condition;
                    },
                  ],
                },
              ],
            },
            {
              name: "latest forecast",
              column: "Yf",
              seriesType: "marker",
              markerType: "circle",
              size: 3,
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              stroke: "red",
              range: {
                startOffset: 0,
                endOffset: 0,
              },
            },
            {
              name: "rmse",
              column: "rmse",
              condition: {
                parameter: "Show RMSE?",
                value: true,
              },
              seriesType: "line",
              plotIndexOffset: 1,
              plotIndex: 0,
              index: -1,
              stroke: "rgb(255, 152, 0)",
            },
          ],
        },
        {
          name: "Heikin Ashi Modified",
          value: "Heikin Ashi Modified",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateHeikinAshiModified",
          parameters: [
            {
              name: "smooth_period",
              label: "smooth period",
              value: "10",
              type: "text",
            },
            {
              name: "long_short",
              label: "Long or short",
              value: "Long & Short",
              type: "select-one",
              items: ["Long", "Short", "Long & Short"],
            },
          ],
          charts: [
            {
              name: "hai",
              column: "hai",
              seriesType: "column",
              plotIndexOffset: 1,
              plotIndex: 0,
              index: -1,
              result: [],
              stroke: [
                {
                  color: "rgb(0, 230, 118)",
                  conditions: ["positive"],
                },
                {
                  color: "rgb(33, 150, 243)",
                  conditions: ["negative"],
                },
              ],
            },
          ],
        },
        {
          name: "Kalman Filter",
          value: "Kalman Filter",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateKalmanFilter",
          parameters: [
            {
              name: "src",
              label: "Source",
              value: "adjclose",
              type: "select-one",
              items: ["open", "high", "low", "close", "adjclose"],
            },
            {
              name: "error_scaler",
              label: "error scaler",
              value: "5",
              type: "text",
            },
          ],
          charts: [
            {
              name: "Kalman Filter",
              column: "X",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              result: [],
              stroke: [
                {
                  color: "rgb(0, 230, 118)",
                  conditions: ["increase"],
                },
                {
                  color: "rgb(255, 152, 0)",
                  conditions: ["decrease"],
                },
              ],
            },
          ],
        },
        {
          name: "MA Crossing",
          value: "MA Crossing",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateMACrossing",
          parameters: [
            {
              name: "src",
              label: "Source",
              value: "adjclose",
              type: "select-one",
              items: ["open", "high", "low", "close", "adjclose"],
            },
            {
              name: "mc1",
              label: "Line 1 MA type",
              value: "EMA",
              type: "select-one",
              items: [
                "ALMA",
                "HMA",
                "eHMA",
                "ZLEMA",
                "DEMA",
                "TEMA",
                "WMA",
                "LSMA",
                "RMA",
                "VIDYA",
                "SSF2",
                "SSF3",
                "EMA",
                "SMA",
              ],
            },
            {
              name: "vlen1",
              label: "Line 1 fast period",
              value: "18",
              type: "text",
            },
            {
              name: "mc2",
              label: "Line 2 MA type",
              value: "EMA",
              type: "select-one",
              items: [
                "ALMA",
                "HMA",
                "eHMA",
                "ZLEMA",
                "DEMA",
                "TEMA",
                "WMA",
                "LSMA",
                "RMA",
                "VIDYA",
                "SSF2",
                "SSF3",
                "EMA",
                "SMA",
              ],
            },
            {
              name: "vlen2",
              label: "Line 2 slow period",
              value: "30",
              type: "text",
            },
            {
              name: "Draw 2nd line?",
              label: "Draw 2nd line?",
              value: true,
              type: "checkbox",
            },
            {
              name: "Show data source?",
              label: "Show data source?",
              value: true,
              type: "checkbox",
            },
            {
              name: "Show Buy/Sell label?",
              label: "Show Buy/Sell label?",
              value: true,
              type: "checkbox",
            },
            {
              name: "Draw zero line?",
              label: "Draw zero line?",
              value: false,
              type: "checkbox",
            },
            {
              name: "long_short",
              label: "Long or short",
              value: "Long",
              type: "select-one",
              items: ["Long", "Short", "Long & Short"],
            },
          ],
          charts: [
            {
              name: "VM1",
              column: "vm1",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              result: [],
              stroke: [
                {
                  color: "rgb(0, 230, 118)",
                  conditions: ["increase"],
                },
                {
                  color: "rgb(255, 82, 82)",
                  conditions: ["decrease"],
                },
              ],
            },
            {
              name: "VM2",
              column: "vm2",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              result: [],
              stroke: [
                {
                  color: "rgb(96, 200, 241)",
                  conditions: ["increase"],
                },
                {
                  color: "rgb(153, 149, 147)",
                  conditions: ["decrease"],
                },
              ],
            },
            {
              name: "MA Crossing source",
              column: "src",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              result: [],
              stroke: "rgb(126, 60, 60)",
            },
          ],
          annotations: [
            {
              name: "MA Crossing Buy Label",
              type: "label",
              plotIndex: 0,
              annotationIndex: [],
              condition: {
                func: function () {
                  var condition = false;

                  return condition;
                },
              },
              parameters: {
                valueAnchor: "vm1",
                text: "Buy",
                fontColor: "#363A45",
              },
              background: {
                fill: "#00E676",
                stroke: "#00E676",
              },
            },
            {
              name: "MA Crossing Sell Label",
              type: "label",
              plotIndex: 0,
              annotationIndex: [],
              condition: {
                func: function () {
                  var condition = false;

                  return condition;
                },
              },
              parameters: {
                valueAnchor: "vm1",
                text: "Sell",
                fontColor: "#FFFFFF",
              },
              background: {
                fill: "#FF5252",
                stroke: "#FF5252",
              },
            },
          ],
        },

        {
          name: "MA deviation",
          value: "MA deviation",
          groupIndex: 1,
          draw: false,
          calculateMADeviation: "calculateMADeviation",
          parameters: [
            {
              name: "Source",
              value: "adjclose",
              type: "select-one",
              items: ["open", "high", "low", "close", "adjclose"],
            },
            {
              name: "MA type",
              value: "HMA",
              type: "select-one",
              items: ["EMA", "HMA", "WMA"],
            },
            {
              name: "MA period",
              value: "50",
              type: "text",
            },
            {
              name: "Sum period",
              value: "2",
              type: "text",
            },
            {
              name: "Long or short",
              value: "Long & Short",
              type: "select-one",
              items: ["Long", "Short", "Long & Short"],
            },
            {
              name: "Data display",
              value: "Signal",
              type: "select-one",
              items: [
                "Signal",
                "profit/trade",
                "P&L accum",
                "Price & Cost",
                "Draw down",
                "NAV $100",
              ],
            },
            {
              name: "Annual NAV",
              value: true,
              type: "checkbox",
            },
            {
              name: "Annual Profit",
              value: false,
              type: "checkbox",
            },
          ],
          seriesType: "line",
          component: [
            {
              name: "MAD",
              stroke: "2 rgb(41, 98, 255)",
              positiveStroke: "rgb(0, 230, 118)",
              negativeStroke: "rgb(255, 82, 82)",
              condition: {
                paramName: "Data display",
                paramValue: "Signal",
              },
              newPlot: true,
              chartRender: [
                {
                  method: "column",
                  param: "MADeviationSumMapping",
                  fromComponent: false,
                },
                {
                  method: "fill",
                  param: "positiveStroke",
                  fromComponent: true,
                },
                {
                  method: "negativeFill",
                  param: "negativeStroke",
                  fromComponent: true,
                },
              ],
            },
            {
              name: "MA deviation profit/trade",
              stroke: "rgb(136, 14, 79)",
              condition: {
                paramName: "Data display",
                paramValue: "profit/trade",
              },
              newPlot: true,
              chartRender: [
                {
                  method: "column",
                  param: "MADeviationProfitMapping",
                  fromComponent: false,
                },
                {
                  method: "fill",
                  param: "stroke",
                  fromComponent: true,
                },
              ],
            },
            {
              name: "MA deviation P&L accum",
              stroke: "2 rgb(255, 109, 0)",
              condition: {
                paramName: "Data display",
                paramValue: "P&L accum",
              },
              newPlot: true,
              chartRender: [
                {
                  method: "line",
                  param: "MAPLMapping",
                  fromComponent: false,
                },
                {
                  method: "fill",
                  param: "stroke",
                  fromComponent: true,
                },
              ],
            },

            {
              name: "MA deviation Price",
              stroke: "rgb(255, 82, 82)",
              condition: {
                paramName: "Data display",
                paramValue: "Price & Cost",
              },
              newPlot: true,
              chartRender: [
                {
                  method: "line",
                  param: "MAPriceMapping",
                  fromComponent: false,
                },
                {
                  method: "stroke",
                  param: "stroke",
                  fromComponent: true,
                },
              ],
            },
            {
              name: "MA deviation Cost",
              stroke: "rgb(76, 175, 80)",
              condition: {
                paramName: "Data display",
                paramValue: "Price & Cost",
              },
              newPlot: true,
              chartRender: [
                {
                  method: "line",
                  param: "MACostMapping",
                  fromComponent: false,
                },
                {
                  method: "stroke",
                  param: "stroke",
                  fromComponent: true,
                },
              ],
            },
            {
              name: "MA deviation Draw down",
              stroke: "2 rgb(41, 98, 255)",
              longStroke: "rgb(224, 64, 251)",
              shortStroke: "rgb(255, 152, 0)",
              condition: {
                paramName: "Data display",
                paramValue: "Price & Cost",
              },
              newPlot: true,
              chartRender: [
                {
                  method: "line",
                  param: "MACostMapping",
                  fromComponent: false,
                },
                {
                  method: "stroke",
                  param: "stroke",
                  fromComponent: true,
                },
              ],
            },
            {
              name: "MA deviation nav",
              stroke: "rgb(76, 175, 80)",
            },
            {
              name: "MA deviation NAV $100",
              stroke: "rgb(33, 150, 243)",
            },
          ],
        },
        {
          name: "MA Drift",
          value: "MA Drift",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateMidDrift",
          parameters: [
            {
              name: "Hi-Lo period",
              value: "9",
              type: "text",
            },
            {
              name: "Z for bounds",
              value: "2",
              type: "text",
            },
            {
              name: "plot bounds?",
              value: true,
              type: "checkbox",
            },
          ],
          seriesType: "line",
          component: [
            {
              name: "mm",
              stroke: "rgb(163, 165, 173)",
              risingStroke: "rgb(0, 230, 118)",
              fallingStroke: "rgb(255, 152, 0)",
            },
            {
              name: "upper bound",
              stroke: "2 rgb(33, 150, 243)",
            },
            {
              name: "lower bound",
              stroke: "2 rgb(33, 150, 243)",
            },
          ],
        },
        {
          name: "MACD Modified",
          value: "MACD Modified",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateMACDModified",
          parameters: [
            {
              name: "Fast Length",
              value: "12",
              type: "text",
            },
            {
              name: "Slow Length",
              value: "26",
              type: "text",
            },
            {
              name: "Source",
              value: "adjclose",
              type: "select-one",
              items: ["open", "high", "low", "close", "adjclose"],
            },
            {
              name: "Signal Smoothing",
              value: "9",
              type: "text",
            },
          ],
          seriesType: "line",
          component: [
            {
              name: "Histogram+",
              stroke: [
                "rgba(38, 166, 154, 1)",
                "rgba(255, 205, 210, 1)",
                "rgba(178, 223, 219, 1)",
                "rgba(239, 83, 80, 1)",
              ],
            },
            {
              name: "MACD",
              stroke: ["rgba(83, 104, 120, 1)", "rgba(0, 148, 255, 1)"],
            },
            {
              name: "Signal",
              stroke: "rgba(255, 106, 0, 1)",
            },
          ],
        },

        {
          name: "RSI Modified",
          value: "RSI Modified",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateRSIModified",
          parameters: [
            {
              name: "RSI period",
              value: "14",
              type: "text",
            },
            {
              name: "RSI Smooth",
              value: "5",
              type: "text",
            },
            {
              name: "Upper bar",
              value: "53",
              type: "text",
            },
            {
              name: "Lower bar",
              value: "47",
              type: "text",
            },
            {
              name: "Plot RSI=50 reference line?",
              value: false,
              type: "checkbox",
            },
          ],
          seriesType: "line",
          component: [
            {
              name: "RSI+",
              stroke: [
                "2 rgb(76, 175, 80)",
                "2 rgb(118, 255, 122)",
                "2 rgb(247, 184, 209)",
                "2 rgb(156, 28, 28)",
                "2 rgb(169, 232, 245)",
              ],
            },
            {
              name: "RSI50",
              stroke: "rgb(120, 123, 134)",
            },
          ],
        },
        {
          name: "Turtle Trade",
          value: "Turtle Trade",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateTurtleTrade",
          parameters: [
            {
              name: "Entry length",
              value: "6",
              type: "text",
            },
            {
              name: "Exit length",
              value: "6",
              type: "text",
            },
            {
              name: "Exit method",
              value: "Tutrle cut",
              type: "select-one",
              items: ["Tutrle cut", "ATR cut"],
            },
            {
              name: "ATR factor",
              value: "0.8",
              type: "text",
            },
            {
              name: "Fill up & align?",
              value: true,
              type: "checkbox",
            },
          ],
          seriesType: "line",
          component: [
            {
              name: "Turtle cut buy",
            },
            {
              name: "Turtle cut sell",
            },
            {
              name: "ART cut buy",
            },
            {
              name: "ATR cut sell",
            },
          ],
          buyStroke: "rgb(76, 175, 80)",
          sellStroke: "rgb(255, 82, 82)",
        },
      ],
    },
    currentIndicators: [],
  },
  reducers: {
    addIndicator(state, action) {
      //   var updatedPayload = deepClone(action.payload);
      var { indicator, charts, annotations } = action.payload;
      console.log(charts);
      var updatedPayload = indicator;
      var addedIndicatorCount = state.currentIndicators.filter(
        (ind) => ind.name === indicator.name
      ).length;

      state.currentIndicators.push({
        ...updatedPayload,
        charts: charts.map((ch) => ({
          ...ch,
          index: ch.index + addedIndicatorCount + 1,
        })),
        annotations,
      });
    },
    setIndicatorParams(state, action) {
      action.payload.parameters.forEach((param, index) => {
        state.currentIndicators[action.payload.index].parameters[index] = {
          ...state.currentIndicators[action.payload.index].parameters[index],
          ...param,
        };
      });
    },
    updateIndicatorPlot(state, action) {
      state.currentIndicators[action.payload.index].charts[
        action.payload.chartIndex
      ].plotIndex = action.payload.plotIndex;
    },
    setAnnotations(state, action) {
      state.currentIndicators[action.payload.index].annotations =
        action.payload.annotations;
    },
    removeSelectedIndicator(state, action) {
      state.currentIndicators = state.currentIndicators.filter(
        (_, index) => index !== action.payload
      );
    },
    resetIndicatorIndex(state, action) {
      let name = action.payload;
      for (let i = 0; i < state.currentIndicators.length; i++) {
        if (state.currentIndicators[i].name === name) {
          for (let j = 0; j < state.currentIndicators[i].charts.length; j++) {
            state.currentIndicators[i].charts[j].index -= 1;
          }
        }
      }
    },
  },
});

export const indicatorActions = indicatorSlice.actions;

export default indicatorSlice;
