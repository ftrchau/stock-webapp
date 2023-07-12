import { createSlice } from "@reduxjs/toolkit";

const indicatorSlice = createSlice({
  name: "indicator",
  initialState: {
    needUpdate: false,
    indicators: {
      "Traditional Indicator": [
        {
          name: "ALMA",
          value: "ALMA",
          description:
            "Arnaud Legoux Moving Average (ALMA) is one of the least lagging moving average by nature. <br /><br /> This script builds two ALMA line, Fast and Slow, and to check their crossing over to generate Buy / Sell Signals. <br /><br /> The drawback of Moving average crossing strategy is the too many crossing during a range trading, therefore, a third ALMA is used to show the trend of the ticker's price as a reference. <br /><br /> The default value for the Trend ALMA is 70 bars, it is due to the quick response of the Arnaud Legoux MA. <br /><br />The Trend ALMA is plotted in dotted line for reference only, it does not affect the Buy/Sell signal generate from the crossing of the Fast and Slow ALMA lines.",
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
          annotations: [
            {
              name: "ALMA buy label",
              type: "label",
              plotIndex: 0,
              annotationIndex: [],
              condition: {
                column: "BSIGNAL",
                value: "BUY",
              },
              parameters: {
                valueAnchor: "fastALMA",
                textParam: "BUY_SELL",
                fontColor: "#363A45",
              },
              background: {
                fill: "#00E676",
                stroke: "#00E676",
              },
            },
            {
              name: "ALMA sell label",
              type: "label",
              plotIndex: 0,
              annotationIndex: [],
              condition: {
                column: "SSIGNAL",
                value: "SELL",
              },
              parameters: {
                valueAnchor: "fastALMA",
                textParam: "BUY_SELL",
                fontColor: "#363A45",
              },
              background: {
                fill: "#FF5252",
                stroke: "#FF5252",
              },
            },
          ],
        },
        {
          name: "Bollinger Bands",
          value: "Bollinger Bands",
          description:
            "Bollinger Bands (BB) are a widely popular technical analysis instrument created by John Bollinger in the early 1980’s. Bollinger Bands consist of a band of three lines which are plotted in relation to security prices. <br /><br /> The line in the middle is usually a Simple Moving Average (SMA) set to a period of 20 days (The type of trend line and period can be changed by the trader; however a 20 day moving average is by far the most popular). <br /><br /> The SMA then serves as a base for the Upper and Lower Bands. <br /><br /> The Upper and Lower Bands are used as a way to measure volatility by observing the relationship between the Bands and price. <br /><br /> Typically the Upper and Lower Bands are set to two standard deviations away from the SMA (The Middle Line); <br /><br /> however the number of standard deviations can also be adjusted by the trader.",
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
          description:
            "MACD is an extremely popular indicator used in technical analysis. <br /><br /> MACD can be used to identify aspects of a security's overall trend. Most notably these aspects are momentum, as well as trend direction and duration. <br /><br /> What makes MACD so informative is that it is actually the combination of two different types of indicators. <br /><br /> First, MACD employs two Moving Averages of varying lengths (which are lagging indicators) to identify trend direction and duration. Then, MACD takes the difference in values between those two Moving Averages (MACD Line) and an EMA of those Moving Averages (Signal Line) and plots that difference between the two lines as a histogram which oscillates above and below a center Zero Line. <br /><br /> The histogram is used as a good indication of a security's momentum.",
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
          ],
        },
        {
          name: "OBV",
          value: "OBV",
          description:
            "The On Balance Volume indicator (OBV) is used in technical analysis to measure buying and selling pressure. <br /><br /> It is a cumulative indicator meaning that on days where price went up, that day's volume is added to the cumulative OBV total. <br /><br /> If price went down, then that day's volume is subtracted from the OBV total. <br /><br /> The OBV value is then plotted as a line for easy interpretation. On Balance volume is primarily used to confirm or identify overall price trends or to anticipate price movements after divergences.",
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
          description:
            "The Relative Strength Index (RSI) is a well versed momentum based oscillator which is used to measure the speed (velocity) as well as the change (magnitude) of directional price movements. <br /><br /> Essentially RSI, when graphed, provides a visual mean to monitor both the current, as well as historical, strength and weakness of a particular market. The strength or weakness is based on closing prices over the duration of a specified trading period creating a reliable metric of price and momentum changes. <br /><br /> Given the popularity of cash settled instruments (stock indexes) and leveraged financial products (the entire field of derivatives); <br /><br /> RSI has proven to be a viable indicator of price movements.",
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
          description:
            "Supertrend is a trend-following indicator based on Average True Range (ATR). <br /><br /> The calculation of its single line combines trend detection and volatility. <br /><br /> It can be used to detect changes in trend direction and to position stops.",
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
                textParam: "ST_BUY_SELL",
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
                textParam: "ST_BUY_SELL",
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
          description:
            "This script applies ARIMA(P,D,Q) to forecast security price one step ahead. <br /><br /> ARIMA(1,1,2) model is based on :  people.duke.edu/~rnau/411arim.htm <br /><br /> Both AR and MA factor is 0.1 for all terms for simplification, age of data = 1/(1-0.1)=1.1, it has a one bar lag. ",
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
          description:
            "This script applies ARIMA(P,D,Q) to forecast security price one step ahead. <br /><br /> ARIMA(1,1,2) model is based on :  people.duke.edu/~rnau/411arim.htm <br /><br /> Both AR and MA factor is 0.1 for all terms for simplification, <br /><br /> age of data = 1/(1-0.1)=1.1, it has a one bar lag.  ",
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
          description:
            "Use a MA, then apply the same MA with a time lag, signal Buy/Sell when the two lines crossover. <br /><br /> The MA line drew has colored for up and down, therefore, it provides the signal too for a single MA line. <br /><br /> The script assumes the 2nd MA line is the slower one to label the Buy/Sell signals.  <br /><br /> There are two kind of strategy that can be applied: <br /> 1. Cross over of the two MA lines for buy/sell <br /> 2. Focus on Line 1 color change, and use Line 2 trend to indentify noise on Line 1. <br /><br /> The crossing of two MA lines is better use with other indicators <br /><br /> There is no single setting to fit all ",
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
              condition: {
                parameter: "Draw 2nd line?",
                value: true,
              },
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              result: [],
              defaultStroke: "2 rgb(41, 98, 255)",
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
              condition: {
                parameter: "Show data source?",
                value: true,
              },
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
                func: function (curr, prev) {
                  var condition = false;

                  if (curr.vm1 > curr.vm2 && prev.vm1 < prev.vm2)
                    condition = true;

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
                func: function (curr, prev) {
                  var condition = false;

                  if (curr.vm1 < curr.vm2 && prev.vm1 > prev.vm2)
                    return condition;

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
          name: "MA Drift",
          value: "MA Drift",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateMidDrift",
          parameters: [
            {
              name: "n",
              label: "Hi-Lo period",
              value: "9",
              type: "text",
            },
            {
              name: "z",
              label: "Z for bounds",
              value: "2",
              type: "text",
            },
            {
              name: "plot bounds?",
              label: "plot bounds?",
              value: true,
              type: "checkbox",
            },
          ],
          charts: [
            {
              name: "mm",
              column: "mm",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              defaultStroke: "rgb(163, 165, 173)",
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
            {
              name: "upper bound",
              column: "ub",
              condition: {
                parameter: "plot bounds?",
                value: true,
              },
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              stroke: "2 rgb(33, 150, 243)",
            },
            {
              name: "lower bound",
              column: "lb",
              condition: {
                parameter: "plot bounds?",
                value: true,
              },
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              stroke: "2 rgb(33, 150, 243)",
            },
          ],
        },
        {
          name: "MACD Modified",
          value: "MACD Modified",
          description:
            "Price percentage Oscillator allows different security to compare their strength. <br /><br /> This study put it into a complete MACD, by adding the signal line.  ",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateMACDModified",
          parameters: [
            {
              name: "fast_length",
              label: "Fast Length",
              value: "12",
              type: "text",
            },
            {
              name: "slow_length",
              label: "Slow Length",
              value: "26",
              type: "text",
            },
            {
              name: "src",
              label: "Source",
              value: "adjclose",
              type: "select-one",
              items: ["open", "high", "low", "close", "adjclose"],
            },
            {
              name: "signal_length",
              label: "Signal Smoothing",
              value: "9",
              type: "text",
            },
          ],
          charts: [
            {
              name: "Signal",
              column: "signal",
              seriesType: "line",
              plotIndexOffset: 1,
              index: -1,
              plotIndex: 0,
              stroke: "rgba(255, 106, 0, 1)",
            },
            {
              name: "Histogram+",
              column: "hist",
              seriesType: "column",
              result: [],
              plotIndexOffset: 1,
              plotIndex: 0,
              index: -1,
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
          name: "RSI Modified",
          value: "RSI Modified",
          description:
            "RSI over 50 is long, RSI below 50 is short. It is ok for most of the security. <br /><br /> eg. Set upper and lower bar to [53 & 47] or [52 & 85] etc if the security has more trendless period. <br /><br /> Line plot by scale the RSI value (%) on the Lo-Hi of each candle. <br /><br /> Line color signaling:  Green=UP, Orange=Down, Gray= sideway or in-transit",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateRSIModified",
          parameters: [
            {
              name: "period",
              label: "RSI period",
              value: "14",
              type: "text",
            },
            {
              name: "speriod",
              label: "RSI Smooth",
              value: "5",
              type: "text",
            },
            {
              name: "ub",
              label: "Upper bar",
              value: "53",
              type: "text",
            },
            {
              name: "lb",
              label: "Lower bar",
              value: "47",
              type: "text",
            },
            {
              name: "Plot RSI=50 reference line?",
              label: "Plot RSI=50 reference line?",
              value: false,
              type: "checkbox",
            },
          ],
          charts: [
            {
              name: "RSI+",
              column: "prisma",
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              result: [],
              index: -1,
              defaultStroke: "2 rgb(169, 232, 245)",
              stroke: [
                {
                  color: "2 rgb(76, 175, 80)",
                  conditions: [
                    function ($this, resultIndex, allResult) {
                      var condition = false;

                      // allResult.reverse();
                      if (allResult[resultIndex]["trend"] === 2)
                        condition = true;
                      return condition;
                    },
                  ],
                },
                {
                  color: "2 rgb(118, 255, 122)",
                  conditions: [
                    function ($this, resultIndex, allResult) {
                      var condition = false;

                      // allResult.reverse();
                      if (allResult[resultIndex]["trend"] === 1)
                        condition = true;
                      return condition;
                    },
                  ],
                },
                {
                  color: "2 rgb(247, 184, 209)",
                  conditions: [
                    function ($this, resultIndex, allResult) {
                      var condition = false;

                      // allResult.reverse();
                      if (allResult[resultIndex]["trend"] === -1)
                        condition = true;
                      return condition;
                    },
                  ],
                },
                {
                  color: "2 rgb(156, 28, 28)",
                  conditions: [
                    function ($this, resultIndex, allResult) {
                      var condition = false;

                      // allResult.reverse();
                      if (allResult[resultIndex]["trend"] === -2)
                        condition = true;
                      return condition;
                    },
                  ],
                },
              ],
            },
            {
              name: "RSI50",
              column: "mid",
              condition: {
                parameter: "Plot RSI=50 reference line?",
                value: true,
              },
              seriesType: "line",
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              stroke: "rgb(120, 123, 134)",
            },
          ],
        },
        {
          name: "Turtle Trade",
          value: "Turtle Trade",
          description:
            "Basic Turtle trade is : <br /> Buy when close is higher than m-day high, exit Buy when close is lower than n-day low. <br /><br /> Sell when close is lower than m-day low, exit Sell when close is higher than n-day high. <br /><br /> ATR cut Turtle trade is: <br /> Exit Buy when close is lower than ATR*factor line, and exit Sell when close is higher than ATR*factor line. <br /><br /> Since Buy and Sell line runs independently, there is chance that both Buy and Sell are triggered ! <br /><br /> There are also cases that both Buy and Sell are exited.  <br /><br /> This script eliminates the overlap and blanks by compare close to close[2] for a decision of a buy or sell, its called signal train. ",
          groupIndex: 1,
          draw: false,
          apiFunc: "calculateTurtleTrade",
          parameters: [
            {
              name: "entryLength",
              label: "Entry length",
              value: "6",
              type: "text",
            },
            {
              name: "exitLength",
              label: "Exit length",
              value: "6",
              type: "text",
            },
            {
              name: "Exit method",
              label: "Exit method",
              value: "Turtle cut",
              type: "select-one",
              items: ["Turtle cut", "ATR cut"],
            },
            {
              name: "atrFactor",
              label: "ATR factor",
              value: "0.8",
              type: "text",
            },
            {
              name: "Fill up & align?",
              label: "Fill up & align?",
              value: false,
              // value: true,
              type: "checkbox",
            },
          ],
          charts: [
            {
              name: "Turtle cut buy",
              column: "llevel",
              seriesType: "marker",
              markerType: "circle",
              fill: "green",
              stroke: "green",
              size: 3,
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              condition: [
                {
                  parameter: "Exit method",
                  value: "Turtle cut",
                },
                {
                  parameter: "Fill up & align?",
                  value: false,
                },
              ],
            },
            {
              name: "Turtle cut sell",
              column: "hlevel",
              seriesType: "marker",
              markerType: "circle",
              fill: "red",
              stroke: "red",
              size: 3,
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              condition: [
                {
                  parameter: "Exit method",
                  value: "Turtle cut",
                },
                {
                  parameter: "Fill up & align?",
                  value: false,
                },
              ],
            },
            {
              name: "ATR cut buy",
              column: "llevelSecond",
              seriesType: "marker",
              markerType: "circle",
              fill: "green",
              stroke: "green",
              size: 3,
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              condition: [
                {
                  parameter: "Exit method",
                  value: "ATR cut",
                },
                {
                  parameter: "Fill up & align?",
                  value: false,
                },
              ],
            },
            {
              name: "ATR cut sell",
              column: "hlevelSecond",
              seriesType: "marker",
              markerType: "circle",
              fill: "red",
              stroke: "red",
              size: 3,
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              condition: [
                {
                  parameter: "Exit method",
                  value: "ATR cut",
                },
                {
                  parameter: "Fill up & align?",
                  value: false,
                },
              ],
            },
            {
              name: "Turtle cut buy Ts",
              column: "llevelTs",
              seriesType: "marker",
              markerType: "circle",
              fill: "green",
              stroke: "green",
              size: 3,
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              condition: [
                {
                  parameter: "Exit method",
                  value: "Turtle cut",
                },
                {
                  parameter: "Fill up & align?",
                  value: true,
                },
              ],
            },
            {
              name: "Turtle cut sell Ts",
              column: "hlevelTs",
              seriesType: "marker",
              markerType: "circle",
              fill: "red",
              stroke: "red",
              size: 3,
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              condition: [
                {
                  parameter: "Exit method",
                  value: "Turtle cut",
                },
                {
                  parameter: "Fill up & align?",
                  value: true,
                },
              ],
            },
            {
              name: "ART cut buy Second",
              column: "llevelTsSecond",
              seriesType: "marker",
              markerType: "circle",
              fill: "green",
              stroke: "green",
              size: 3,
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              condition: [
                {
                  parameter: "Exit method",
                  value: "ATR cut",
                },
                {
                  parameter: "Fill up & align?",
                  value: true,
                },
              ],
            },
            {
              name: "ATR cut sell Second",
              column: "hlevelTsSecond",
              seriesType: "marker",
              markerType: "circle",
              fill: "red",
              stroke: "red",
              size: 3,
              plotIndexOffset: 0,
              plotIndex: 0,
              index: -1,
              condition: [
                {
                  parameter: "Exit method",
                  value: "ATR cut",
                },
                {
                  parameter: "Fill up & align?",
                  value: true,
                },
              ],
            },
          ],
        },
      ],
    },
    currentIndicators: [],
    stockTools: [
      {
        name: "Volume Profile",
        parameters: [
          {
            name: "Row Size",
            label: "Row Size",
            value: "24",
            type: "text",
          },
        ],
        positiveVolumeFill: "rgb(38, 166, 154)",
        negativeVolumeFill: "rgb(239, 83, 80)",
        VolumeStroke: "1 rgb(255, 255, 255)",
        draw: false,
      },
      {
        name: "Pivot Hi Lo",
        description:
          "Pivot Points (High/Low), also known as Bar Count Reversals. <br /><br />   It is the highest/lowest point from n bar in left and m bars to right. <br /><br />  So, it is a point of concern, and its suggestion for Resistance and Support levels. <br /><br />  This study will plot the line of the Highest/lowest until a new Pivot Hi/Lo shows up. ",
        parameters: [
          {
            name: "left",
            label: "Left",
            value: "30",
            type: "text",
          },
          {
            name: "right",
            label: "Right",
            value: "30",
            type: "text",
          },
          {
            name: "Draw Fibo line?",
            label: "Draw Fibo line?",
            value: true,
            type: "checkbox",
          },
          {
            name: "Extend upward fibo?",
            label: "Extend upward fibo?",
            value: false,
            type: "checkbox",
          },
          {
            name: "Extend downward fibo?",
            label: "Extend downward fibo?",
            value: false,
            type: "checkbox",
          },
        ],
        pivotHighStroke: "rgb(136, 14, 79)",
        pivotLowStroke: "rgb(33, 150, 243)",
        chartIndex: -1,
        draw: false,
      },
      {
        name: "52 Wk Hi Lo Range - Buy Sell",
        description:
          "This is a study to check the position of current price in the Highest - lowest range of selected length, and provide a notification for potential sell or buy. <br /><br /> Default value = 240 is proxy to 1 year for daily chart  <br /><br /> Suggestion : Daily chart  - 2Y=480, 1Y=240, 6m=120, 3m=60  <br /> Weekly chart - 3Y=156, 2Y=104, 1Y=52   etc...",
        parameters: [
          {
            name: "adjust",
            label: "Adjust Data for dividends?",
            value: true,
            type: "checkbox",
          },
          {
            name: "len",
            label: "Period",
            value: "90",
            type: "text",
          },
          {
            name: "UB",
            label: "Hi trigger level",
            value: "93",
            type: "text",
          },
          {
            name: "LB",
            label: "Lo trigger Level",
            value: "7",
            type: "text",
          },
        ],
        chartIndex: -1,
        draw: false,
      },
      {
        name: "MR Bottom Detector",
        description:
          "Applies the basic idea that strong negative MACD and low RSI level to check the possiblity of a Bottom.  <br /><br /> Since this is an estimation/predictive one, it use the colours to display the confidence of the prediction.  <br /><br /> The light color is weak and the deep color means a higher confidence.  <br /><br /> There are some instruments has a much lower volatility / true range, like currencies, so this script arrange the probabilities to be display in 3 bands: High band, mid band and Low band.  <br /><br /> User can switch manually between the two bands to see the result.  <br /><br /> eg. currencies and commodities better use low band. <br /><br /> A 100 day True Range percentage is used to set the critical level for which band to be apply to each security.  <br /><br /> RSI must be low for a bottom, however, RSI various in different environment. So a sensitivity level for manual control is built. Instead of let users input RSI hurdle, the sensitivity level picked 3 different RSI levels for easy use.  ",
        parameters: [
          {
            name: "fastLength",
            label: "Fast Length",
            value: "12",
            type: "text",
          },
          {
            name: "slowLength",
            label: "Slow Length",
            value: "26",
            type: "text",
          },
          {
            name: "rinput",
            label: "Sensitivity (1:weak)",
            value: "2",
            type: "select-one",
            items: ["1", "2", "3"],
          },
          {
            name: "bandselect",
            label: "Bands select",
            value: "auto",
            type: "select-one",
            items: ["auto", "my input"],
          },
          {
            name: "L1",
            label: "auto Hi Band threshold",
            value: "30",
            type: "text",
          },
          {
            name: "L2",
            label: "auto M Band threshold",
            value: "20",
            type: "text",
          },
          {
            name: "band",
            label: "Filters Band",
            value: "Hi band",
            type: "select",
            items: ["Hi band", "M band", "Lo band"],
          },
        ],
        chartIndex: -1,
        draw: false,
      },
      {
        name: "Linear Regression Channel on Pivot",
        description:
          "This auto linear regression channel is draw by input the starting point (as period of regression)  <br /><br /> Pearsons correlation coefficient  (R-sq) is provided, it is very important because a high value means the regression channel is valid. ",
        parameters: [
          {
            name: "left",
            label: "Left",
            value: "20",
            type: "text",
          },
          {
            name: "Right",
            label: "Right",
            value: "20",
            type: "text",
          },
          {
            name: "shl",
            label: "Base on Pivot",
            value: "Hi",
            type: "select-one",
            items: ["Hi", "Lo"],
          },
          {
            name: "Display Pivot lines?",
            label: "Display Pivot lines?",
            value: true,
            type: "checkbox",
          },
          {
            name: "deviations",
            label: "Deviation(s)",
            value: "2",
            type: "text",
          },
          {
            name: "Extend Method",
            label: "Extend Method",
            value: "None",
            type: "select-one",
            items: ["Right", "None"],
          },
        ],
        chartIndex: -1,
        draw: false,
        pivotHighStroke: "rgb(136, 14, 79)",
        pivotLowStroke: "rgb(33, 150, 243)",
      },
      {
        name: "Zig Zag + LR",
        description:
          "This script is based on the script by https://www.tradingview.com/v/I2xTwDzy/  with credit to Tr0sT. <br /><br /> This script modified the original and add the predictive lines for the last section of the zig zag.  <br /><br /> The yellow line points to latest high/low point, and then the red line points to the latest close, it service <br /><br /> as the predictive trend reversal. Both lines will keep changing !!! <br /><br /> The bar counts of the red line is showed in the orange label.  <br /><br /> Note: The yellow label shows the price % change of the Yellow dotted line **  <br /><br /> ZZ Lagging time = length : a new pivot point can only be confirm if lenght of bars checked.  <br /><br /> therefore, longer Zig Zag, longer lagging.  <br /><br /> Linear regression for the unconfirm period is added in this script. <br /><br /> Price change of zig zag pivot points and bar counts is also available.  <br /><br /> RSI is also able to display. Zig zag helps in counting waves, filter noises, pattern recongnition (eg head & shoulder, dual bottom/top etc) <br /><br /> Due to its lagging nature, not recommend for trading signals alone. ",
        parameters: [
          {
            name: "length",
            label: "High/Low length",
            value: "20",
            type: "text",
          },
          {
            name: "Period for VP & Fibo",
            label: "Period for VP & Fibo",
            value: "Auto",
            type: "select-one",
            items: ["Auto", "My input"],
          },
          {
            name: "Display Linear Regression?",
            label: "Display Linear Regression?",
            value: true,
            type: "checkbox",
          },
          {
            name: "reset1",
            label: "Version",
            value: "A",
            type: "select-one",
            items: ["A", "B"],
          },
        ],
        chartIndex: -1,
        annotationIndex: [],
        draw: false,
        zigzagFontColor: "rgb(54,58,69)",
        lastlowUpdateFontColor: "rgb(242, 46, 173, 90)",
        lastHighUpdateFontColor: "rgb(46, 242, 59, 72)",
        lastLabelFontColor: "rgb(255,255,255)",
        lastLabelFillColor: "rgb(44, 152, 240)",
        lastLabelRSIFillColor: "rgb(235, 241, 35)",
        lastLabelRSIFontColor: "rgb(54,58,69)",
        lastLabelCountDownFillColor: "rgb(239, 189, 113)",
        zigzagPredictiveStrokeColor: "rgb(181, 175, 21)",
        zigzagSecondPredictiveStrokeColor: "rgb(255, 82, 82)",
      },
    ],
    currentStockTools: [],
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
    addStockTools(state, action) {
      state.currentStockTools.push(action.payload);
    },
    setToolChartPlotIndex(state, action) {
      const { stockToolName, plotIndex } = action.payload;

      const stockToolIndex = state.currentStockTools.findIndex(
        (p) => p.name === stockToolName
      );

      if (stockToolIndex > -1) {
        var paraFind = state.currentStockTools.find(
          (elem) => elem.name === stockToolName
        );
        paraFind.chartIndex = plotIndex;
      }
    },
    setToolChartAnnotationIndex(state, action) {
      const { stockToolName, annotationIndex } = action.payload;

      const stockToolIndex = state.currentStockTools.findIndex(
        (p) => p.name === stockToolName
      );

      if (stockToolIndex > -1) {
        var paraFind = state.currentStockTools.find(
          (elem) => elem.name === stockToolName
        );
        paraFind.annotationIndex = annotationIndex;
      }
    },
    removeSelectedStockTool(state, action) {
      console.log(action.payload);
      state.currentStockTools.splice(action.payload, 1);
    },
    setStockToolParams(state, action) {
      action.payload.parameters.forEach((param, index) => {
        state.currentStockTools[action.payload.index].parameters[index] = {
          ...state.currentStockTools[action.payload.index].parameters[index],
          ...param,
        };
      });
    },
    resetCurrentIndicatorStockTools(state) {
      state.currentIndicators = [];
      state.currentStockTools = [];
    },
    setNeedUpdate(state, action) {
      state.needUpdate = action.payload;
    },
  },
});

export const indicatorActions = indicatorSlice.actions;

export default indicatorSlice;
