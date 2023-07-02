import "./App.css";
import AnyChart from "anychart-react";
import anychart from "anychart";

import moment from "moment";

import React from "react";
import { useState, useEffect, useCallback } from "react";

import { useSelector, useDispatch } from "react-redux";
import { indicatorActions } from "./store/indicator-slice";

function App() {
  const [chart, setChart] = useState(null);
  const [chartTable, setChartTable] = useState(null);
  const [ticker, setTicker] = useState("NVDA");
  const [stockData, setStockData] = useState([]);

  const [indicatorTable, setIndicatorTable] = useState({
    ALMAFastTable: null,
    ALMASlowTable: null,
    ALMATrendTable: null,
  });

  const [indicatorMapping, setIndicatorMapping] = useState({
    ALMAFastMapping: null,
    ALMASlowMapping: null,
    ALMATrendMapping: null,
  });

  const indicators = useSelector((state) => state.indicator.indicators);
  const currentIndicators = useSelector(
    (state) => state.indicator.currentIndicators
  );

  const dispatch = useDispatch();

  useEffect(() => {
    console.log("run first setting");
    setTicker("NVDA");
    setChart(new anychart.stock());
    setChartTable(anychart.data.table());
    setStockData([
      ["2004-01-02", 27.58, 27.77, 27.33, 27.45, 44487700],
      ["2004-01-05", 27.73, 28.18, 27.72, 28.14, 67333696],
      ["2004-01-06", 28.19, 28.28, 28.07, 28.24, 46950800],
      ["2004-01-07", 28.17, 28.31, 28.01, 28.21, 54298200],
      ["2004-01-08", 28.39, 28.48, 28, 28.16, 58810800],
      ["2004-01-09", 28.03, 28.06, 27.59, 27.66, 67079900],
      ["2004-01-12", 27.67, 27.73, 27.35, 27.57, 55845200],
      ["2004-01-13", 27.55, 27.64, 27.26, 27.43, 51555900],
      ["2004-01-14", 27.52, 27.73, 27.47, 27.7, 43907000],
      ["2004-01-15", 27.55, 27.72, 27.42, 27.54, 58504100],
      ["2004-01-16", 27.71, 27.88, 27.53, 27.81, 63983400],
      ["2004-01-20", 27.98, 28.2, 27.93, 28.1, 63068500],
      ["2004-01-21", 28.13, 28.3, 27.85, 28.3, 53570600],
      ["2004-01-22", 28.36, 28.44, 27.94, 28.01, 78425200],
      ["2004-01-23", 28.28, 28.76, 28.22, 28.48, 127259104],
      ["2004-01-26", 28.49, 28.83, 28.32, 28.8, 58299600],
    ]);
  }, [currentIndicators]);

  useEffect(() => {
    console.log("run chart table ass data");
    if (chartTable) {
      chartTable.addData(stockData);
      // setTableMapping(chartTable.mapAs());
    }
  }, [chartTable, stockData, currentIndicators]);

  useEffect(() => {
    console.log("running chart plot");
    console.log(currentIndicators);
    if (!chart) return;
    chart
      .plot(0)
      .candlestick(chartTable.mapAs({ open: 1, high: 2, low: 3, close: 4 }))
      .name(ticker);
    chart.tooltip(false);
    chart.crosshair().displayMode("float");
    if (currentIndicators.length > 0) {
      let allResult = currentIndicators[0].result;
      currentIndicators[0].charts.forEach((ind) => {
        let addResult = allResult.map((p) => {
          return [p.date, +p[ind.column]];
        });
        var table = anychart.data.table();
        table.addData(addResult);
        var mapping = table.mapAs();
        mapping.addField("value", 1);
        chart.plot(0).line(mapping).name(ind.name);
      });
    }
    chart
      .plot(0)
      .legend()
      .itemsFormat(function () {
        var series = this.series;
        if (series.name() === ticker) {
          return (
            series.name() +
            " " +
            (this.open ? "O" + this.open.toFixed(2) : "") +
            (this.high ? "H" + this.high.toFixed(2) : "") +
            (this.low ? "L" + this.low.toFixed(2) : "") +
            (this.close ? "C" + this.close.toFixed(2) : "")
          );
        } else {
          return (
            series.name() + " " + (this.value ? this.value.toFixed(2) : "")
          );
        }
      });
  }, [chart, chartTable, ticker, currentIndicators]);

  // useEffect(() => {
  //   console.log(currentIndicators);
  //   if (currentIndicators.length > 0) {
  //     // currentIndicators[0].charts.forEach(ind => {

  //     // })
  //     console.log(currentIndicators);
  //   }
  // }, [currentIndicators]);

  const addIndicator = () => {
    console.log("testing");
    dispatch(
      indicatorActions.addIndicator(indicators["Traditional Indicator"][0])
    );
    console.log(currentIndicators);
  };
  // }, []);

  return (
    <>
      <button onClick={addIndicator}>addIndicator</button>
      <AnyChart
        id="stock-chart"
        width="100%"
        height="100%"
        instance={chart}
        title={ticker}
      />
    </>
  );
}

export default React.memo(App);
