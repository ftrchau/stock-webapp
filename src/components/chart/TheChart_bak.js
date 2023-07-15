import { useState, useEffect, useRef, useCallback } from "react";

import { useQuery } from "react-query";

import moment from "moment";
import AnyChart from "anychart-react";
import anychart from "anychart";

import ChartToolBar from "../toolbar/ChartToolBar";
import ChartTopBar from "../toolbar/ChartTopBar";
import ListenChart from "./ListenChart";
import IndicatorUpdate from "./IndicatorUpdate";

import { Container, Row, Col } from "react-bootstrap";

import { getStockData } from "../../api/stock";

import { useDispatch, useSelector } from "react-redux";
import { indicatorActions } from "../../store/indicator-slice";
import { stockActions } from "../../store/stock-slice";

import indicatorApi from "../../api/indicator";

import "./TheChart.css";

const getStockMax = (data, start, end) => {
  ////console.log(data);
  return Math.max(
    ...data
      .filter((p) => p[0] > start && p[0] < end && p[2] != null)
      .map((p) => p[2])
  );
};
const getStockMin = (data, start, end) => {
  return Math.min(
    ...data
      .filter((p) => p[0] > start && p[0] < end && p[3] !== null)
      .map((p) => p[3])
  );
};

const indicatorCallback = async (api_func, params) => {
  return await indicatorApi[api_func](params);
};

const scrollLeftTimeUnit = (interval) => {
  let timeUnit = "";
  let intervalChar = interval.charAt(interval.length - 1);

  if (intervalChar === "m") {
    timeUnit = "hours";
  } else if (intervalChar === "h") {
    timeUnit = "day";
  } else if (
    intervalChar === "d" ||
    intervalChar === "k" ||
    intervalChar === "o"
  ) {
    timeUnit = "months";
  }

  return timeUnit;
};

const intervalTimeUnit = (interval) => {
  let timeUnit = "";
  let intervalChar = interval.charAt(interval.length - 1);
  if (intervalChar === "m") {
    timeUnit = "minutes";
  } else if (intervalChar === "h") {
    timeUnit = "hours";
  } else if (intervalChar === "d") {
    timeUnit = "days";
  } else if (intervalChar === "k") {
    timeUnit = "weeks";
  } else if (intervalChar === "o") {
    timeUnit = "months";
  }

  return timeUnit;
};

var FLineannotationIndex = [];
var FLineMax = 0;
var FLineMin = 0;

const drawFLine = (
  chart,
  interval,
  stockData,
  lastPvh,
  lastPvl,
  firstPvh,
  firstPvl,
  ud,
  j,
  showH,
  showL,
  toolName
) => {
  var controller = chart.plot(0).annotations();
  var lastPoint = stockData[stockData.length - 1][0];
  var dd = lastPvh[1] - lastPvl[1];
  var base = lastPvl[1] + j * dd;

  var line = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base,
    secondXAnchor: lastPoint,
    secondValueAnchor: base,
    normal: { stroke: "1 #00E676" },
  });
  FLineannotationIndex.push(line);
  var label = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base,
    text: "0 ( " + base.toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label.background(false);
  label.allowEdit(false);
  FLineannotationIndex.push(label);

  var line236 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 0.236 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 0.236 * dd * ud,
    normal: { stroke: "1 #787B86" },
  });
  FLineannotationIndex.push(line236);

  var label236 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 0.236 * dd * ud,
    text: "0.236 ( " + (base + 0.236 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label236.background(false);
  label236.allowEdit(false);
  FLineannotationIndex.push(label236);
  // label236.anchor("center-top");
  // label236.padding(0, 0, 0, 0);

  var line382 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 0.382 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 0.382 * dd * ud,
    normal: { stroke: "1 #808000" },
  });
  FLineannotationIndex.push(line382);

  var label382 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 0.382 * dd * ud,
    text: "0.382 ( " + (base + 0.382 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label382.background(false);
  label382.allowEdit(false);
  FLineannotationIndex.push(label382);

  var line500 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 0.5 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 0.5 * dd * ud,
    normal: { stroke: "1 #E040FB" },
  });
  FLineannotationIndex.push(line500);

  var label500 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 0.5 * dd * ud,
    text: "0.5 ( " + (base + 0.5 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label500.background(false);
  label500.allowEdit(false);
  FLineannotationIndex.push(label500);

  var line618 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 0.618 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 0.618 * dd * ud,
    normal: { stroke: "1 #808000" },
  });
  FLineannotationIndex.push(line618);
  var label618 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 0.618 * dd * ud,
    text: "0.618 ( " + (base + 0.618 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label618.background(false);
  label618.allowEdit(false);
  FLineannotationIndex.push(label618);
  var line786 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 0.786 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 0.786 * dd * ud,
    normal: { stroke: "1 #787B86" },
  });
  FLineannotationIndex.push(line786);
  var label786 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 0.786 * dd * ud,
    text: "0.786 ( " + (base + 0.786 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label786.background(false);
  label786.allowEdit(false);
  FLineannotationIndex.push(label786);
  var line100 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 1 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 1 * dd * ud,
    normal: { stroke: "1 #FF9800" },
  });
  FLineannotationIndex.push(line100);
  var label100 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 1.0 * dd * ud,
    text: "1.0 ( " + (base + 1.0 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label100.background(false);
  label100.allowEdit(false);
  FLineannotationIndex.push(label100);
  if (showH) {
    var labH = controller.label({
      xAnchor: lastPvl[0],
      valueAnchor: base + 1.0 * dd * ud,
      text: "Hi",
      normal: { fontColor: "rgb(255, 82, 82)" },
    });
    labH.background(false);
    labH.allowEdit(false);
    FLineannotationIndex.push(labH);
  }

  if (showL) {
    var labL = controller.label({
      xAnchor: lastPvl[0],
      valueAnchor: base,
      text: "Lo",
      normal: { fontColor: "rgb(33, 150, 243)" },
    });
    labL.background(false);
    labL.allowEdit(false);
    FLineannotationIndex.push(labL);
  }

  // var max = Math.max(this.globalMax, base, base + 1.236 * dd * ud);
  // var min = Math.min(this.globalMin, base, base + 1.236 * dd * ud);
  // var max = Math.max(base, base + 1.236 * dd * ud);
  // var min = Math.min(base, base + 1.236 * dd * ud);

  // chart.plot(0).yScale().maximum(max.toFixed(2));
  // chart.plot(0).yScale().minimum(min.toFixed(2));
  let range = chart.getSelectedRange();
  let visibleStockData = stockData.filter((p) => {
    return range.firstSelected <= p[0] && range.lastSelected >= p[0];
  });

  let stockMax = visibleStockData.map((p) => p[2]);
  let stockMin = visibleStockData.map((p) => p[3]);
  FLineMax = Math.max(...stockMax, base, base + 1.236 * dd * ud);
  FLineMin = Math.min(...stockMin, base, base + 1.236 * dd * ud);

  chart
    .plot(0)
    .yScale()
    .maximum((FLineMax * 1.01).toFixed(2));
  chart
    .plot(0)
    .yScale()
    .minimum((FLineMin * 0.99).toFixed(2));

  FLineannotationIndex.push(line);
  FLineannotationIndex.push(label);
  FLineannotationIndex.push(line236);
  FLineannotationIndex.push(label236);
  FLineannotationIndex.push(line382);
  FLineannotationIndex.push(label382);
  FLineannotationIndex.push(line500);
  FLineannotationIndex.push(label500);
  FLineannotationIndex.push(line618);
  FLineannotationIndex.push(label618);
  FLineannotationIndex.push(line786);
  FLineannotationIndex.push(label786);
  FLineannotationIndex.push(line100);
  FLineannotationIndex.push(label100);
};

const addFline = async function (
  chart,
  interval,
  stockData,
  stockTool,
  ticker,
  adjustDividend,
  startDate,
  endDate,
  update = false
) {
  let apiInputParam = {};
  stockTool.parameters.forEach((opt) => {
    apiInputParam[opt.name] =
      Number.isNaN(+opt.value) || typeof opt.value == "boolean"
        ? opt.value
        : +opt.value;
  });
  const PivotHiLoresult = await indicatorApi.calculatePivotHiLo({
    ...apiInputParam,
    ticker,
    interval,
    adjustDividend,
    startDate,
    endDate,
  });
  if (PivotHiLoresult) {
    ////console.log(PivotHiLoresult);
    let PivotHiLopvhData = PivotHiLoresult.map((p) => {
      return [moment(p.date).valueOf(), p.pvh];
    });
    let PivotHiLopvlData = PivotHiLoresult.map((p) => {
      return [moment(p.date).valueOf(), p.pvl];
    });

    var PivotHiLopvhTable = anychart.data.table();
    PivotHiLopvhTable.addData(PivotHiLopvhData);

    var PivotHiLopvhMapping = PivotHiLopvhTable.mapAs();
    PivotHiLopvhMapping.addField("value", 1);

    var PivotHiLopvlTable = anychart.data.table();
    PivotHiLopvlTable.addData(PivotHiLopvlData);

    var PivotHiLopvlMapping = PivotHiLopvlTable.mapAs();
    PivotHiLopvlMapping.addField("value", 1);

    ////console.log(PivotHiLopvhData);
    ////console.log(PivotHiLopvlData);
    if (!update) {
      chart.current
        .plot(0)
        .line(PivotHiLopvhMapping)
        .stroke(stockTool.pivotHighStroke, 1, 1)
        .name("Pivot High");

      chart.current
        .plot(0)
        .line(PivotHiLopvlMapping)
        .stroke(stockTool.pivotLowStroke, 1, 1)
        .name("Pivot Low");
    } else {
      let seriesNames = ["Pivot High", "Pivot Low"];
      let seriesMapping = {
        "Pivot High": PivotHiLopvhMapping,
        "Pivot Low": PivotHiLopvlMapping,
      };
      let seriesLength = chart.current.plot(0).getSeriesCount();
      for (let i = seriesLength - 1 + 100; i > -1; i--) {
        if (chart.current.plot(0).getSeries(i)) {
          let seriesName = chart.current.plot(0).getSeries(i).name();
          if (seriesNames.includes(seriesName)) {
            chart.current.plot(0).getSeries(i).data(seriesMapping[seriesName]);
          }
        }
      }
    }

    if (stockTool.parameters.find((p) => p.name === "Draw Fibo line?").value) {
      var lastPvh = [];
      var lastPvl = [];
      var firstPvh = [];
      var firstPvl = [];

      for (let i = PivotHiLopvhData.length - 1; i > -1; i--) {
        if (
          PivotHiLopvhData[i][1] &&
          PivotHiLopvhData[i - 1][1] !== PivotHiLopvhData[i][1]
        ) {
          lastPvh = PivotHiLopvhData[i];
          break;
        }
      }
      for (let i = PivotHiLopvlData.length - 1; i > -1; i--) {
        if (
          PivotHiLopvlData[i][1] &&
          PivotHiLopvlData[i - 1][1] !== PivotHiLopvlData[i][1]
        ) {
          lastPvl = PivotHiLopvlData[i];
          break;
        }
      }
      for (let i = PivotHiLopvhData.length - 1; i > -1; i--) {
        if (PivotHiLopvhData[i][1]) {
          firstPvh = PivotHiLopvhData[i];
          break;
        }
      }
      for (let i = PivotHiLopvlData.length - 1; i > -1; i--) {
        if (PivotHiLopvlData[i][1]) {
          firstPvl = PivotHiLopvlData[i];
          break;
        }
      }
      if (lastPvh.length > 0 && lastPvl.length > 0) {
        drawFLine(
          chart.current,
          interval,
          stockData,
          lastPvh,
          lastPvl,
          firstPvh,
          firstPvl,
          1,
          0,
          true,
          true,
          stockTool.name
        );

        if (
          stockTool.parameters.find((p) => p.name === "Extend upward fibo?")
            .value
        ) {
          drawFLine(
            chart.current,
            interval,
            stockData,
            lastPvh,
            lastPvl,
            firstPvh,
            firstPvl,
            1,
            1,
            false,
            false,
            stockTool.name
          );
        }
        if (
          stockTool.parameters.find((p) => p.name === "Extend downward fibo?")
            .value
        ) {
          drawFLine(
            chart.current,
            interval,
            stockData,
            lastPvh,
            lastPvl,
            firstPvh,
            firstPvl,
            -1,
            0,
            false,
            false,
            stockTool.name
          );
        }
      }
    }
  }
};

function TheChart(props) {
  ////console.log("function rerender??");
  const dispatch = useDispatch();

  const { ticker, initialPicked } = props;
  const startDate = useSelector((state) => state.stock.startDate);
  const endDate = useSelector((state) => state.stock.endDate);
  const interval = useSelector((state) => state.stock.interval);

  const [adjustDividend, setAdjustDividend] = useState(false);
  const [realTime, setRealTime] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [timezone, setTimezone] = useState({});

  const chart = useRef(null);
  const chartTable = useRef(null);
  const chartMapping = useRef(null);
  const exchangeTimeZone = useRef({});
  const realStartTime = useRef(
    moment().subtract(21, "month").format("YYYY-MM-DD")
  );
  const realEndTime = useRef(moment().format("YYYY-MM-DD"));
  const plotIndex = useRef(0);

  // const indicators = useSelector((state) => state.indicator.indicators);

  const { error, data, isFetching } = useQuery({
    queryKey: [
      "getStockData",
      {
        ticker: props.ticker,
        startDate,
        endDate,
        interval,
        adjustDividend,
        realTime,
      },
    ],
    queryFn: getStockData,
  });

  const addIndicator = useCallback(
    async (indicator) => {
      if (!chart.current) return;
      var charts = indicator.charts.map((item) => ({ ...item }));
      var annotations =
        "annotations" in indicator
          ? indicator.annotations.map((item) => ({
              ...item,
              annotationIndex: [...item.annotationIndex],
            }))
          : [];

      let apiInputParam = {};
      indicator.parameters.forEach((opt) => {
        apiInputParam[opt.name] =
          Number.isNaN(+opt.value) || typeof opt.value == "boolean"
            ? opt.value
            : +opt.value;
      });

      let allResult = await indicatorCallback(indicator.apiFunc, {
        ...apiInputParam,
        ticker,
        interval,
        adjustDividend,
        startDate,
        endDate,
        realTime,
      });

      var plotAddedBy = 0;

      indicator.charts.forEach((ind, index) => {
        if ("condition" in ind) {
          if (Array.isArray(ind.condition)) {
            if (
              !ind.condition.reduce(
                (accumulator, currentCond) =>
                  accumulator &&
                  apiInputParam[currentCond.parameter] === currentCond.value,
                true
              )
            ) {
              return;
            }
          } else {
            if (apiInputParam[ind.condition.parameter] !== ind.condition.value)
              return;
          }
        }
        let addResult;

        if ("range" in ind) {
          ////console.log(allResult);
          addResult = allResult
            .filter(
              (value, index) =>
                index >= allResult.length - 1 - ind.range.startOffset &&
                index <= allResult.length - 1 - ind.range.endOffset
            )
            .map((p, index) => {
              return [moment(p.date).valueOf(), +p[ind.column]];
            });
        } else {
          addResult = allResult.map((p, index) => {
            return [moment(p.date).valueOf(), +p[ind.column]];
            // return [moment.utc(p.date).valueOf(), +p[ind.column]];
            // return [
            //   moment.utc(p.date).format("YYYY-MM-DD hh:mm:ss"),
            //   +p[ind.column],
            // ];
          });
        }

        // ////console.log(allResult);

        // addResult.reverse();
        ////console.log(addResult);
        var table = anychart.data.table();
        table.addData(addResult);
        ////console.log(addResult);
        var mapping = table.mapAs();
        mapping.addField("value", 1);
        var chartTemp;

        if (Array.isArray(ind.stroke)) {
          charts[index].result = allResult;
          // chart.current
          // .plot(
          //   ind.plotIndexOffset > plotAddedBy
          //     ? plotIndex.current + 1
          //     : plotAddedBy > 0
          //     ? plotIndex.current
          //     : 0
          // )
          if (!chart.current) return;
          chartTemp = chart.current
            .plot(
              ind.plotIndexOffset > plotAddedBy
                ? plotIndex.current + 1
                : plotAddedBy > 0
                ? plotIndex.current
                : 0
            )
            [ind.seriesType](mapping)
            [ind.seriesType === "column" ? "fill" : "stroke"](function () {
              if (!this.value) return this.sourceColor;
              if (!this.x) return this.sourceColor;
              // ////console.log(this.x);
              let resultIndex = addResult.findIndex(
                // (p) => p[0] === moment(this.x).valueOf()
                // (p) => moment(p[0]).valueOf() === moment.utc(this.x).valueOf()
                (p) => this.value === p[1]
              );
              if (resultIndex < 0) {
                // ////console.log(this.x);
                // ////console.log(addResult);
                ////console.log(this);
                return this.sourceColor;
              }
              if (!addResult[resultIndex - 1]) return;
              let prevValue = addResult[resultIndex - 1][1];

              let strokeColor = "";
              let conditions_temp = "";
              // ////console.log("is this still affecting??");

              for (let i = 0; i < ind.stroke.length; i++) {
                conditions_temp = "";
                for (let j = 0; j < ind.stroke[i].conditions.length; j++) {
                  // conditions_temp = "";
                  if (typeof ind.stroke[i].conditions[j] === "string") {
                    if (ind.stroke[i].conditions[j] === "positive") {
                      conditions_temp =
                        conditions_temp === ""
                          ? this.value >= 0
                          : conditions_temp && this.value >= 0;
                    }
                    if (ind.stroke[i].conditions[j] === "negative") {
                      conditions_temp =
                        conditions_temp === ""
                          ? this.value < 0
                          : conditions_temp && this.value < 0;
                    }
                    if (ind.stroke[i].conditions[j] === "increase") {
                      conditions_temp =
                        conditions_temp === ""
                          ? this.value > prevValue
                          : conditions_temp && this.value > prevValue;
                    }
                    if (ind.stroke[i].conditions[j] === "decrease") {
                      conditions_temp =
                        conditions_temp === ""
                          ? this.value < prevValue
                          : conditions_temp && this.value < prevValue;
                    }
                  } else {
                    conditions_temp =
                      conditions_temp === ""
                        ? ind.stroke[i].conditions[j](
                            this,
                            resultIndex,
                            allResult
                          )
                        : ind.stroke[i].conditions[j](
                            this,
                            resultIndex,
                            allResult
                          );
                  }
                }
                if (conditions_temp) {
                  strokeColor = ind.stroke[i].color;
                  break;
                }
              }

              if (conditions_temp) {
                return strokeColor;
              } else {
                if ("defaultStroke" in ind) {
                  return ind.defaultStroke;
                }
              }

              return this.sourceColor;
            })
            .name(ind.name);
        } else {
          chartTemp = chart.current
            .plot(
              ind.plotIndexOffset > plotAddedBy
                ? plotIndex.current + 1
                : plotAddedBy > 0
                ? plotIndex.current
                : 0
            )
            [ind.seriesType](mapping)
            ["name"](ind.name)
            [ind.seriesType === "column" ? "fill" : "stroke"](ind.stroke);
        }

        if (ind.seriesType === "marker") {
          chartTemp.size(ind.size);
        }
        if ("markerType" in ind) {
          chartTemp.type(ind.markerType);
        }

        if ("fill" in ind) {
          chartTemp.fill(ind.fill);
        }

        if (ind.seriesType === "column") {
          chartTemp.minWidth(100);
        }
        // ////console.log(
        //   moment(realEndTime.current)
        //     .subtract(9, scrollLeftTimeUnit(interval))
        //     .format("YYYY-MM-DD HH:mm:ss")
        // );
        // chart.current.selectRange(
        //   moment(realEndTime.current)
        //     .subtract(9, scrollLeftTimeUnit(interval))
        //     .format("YYYY-MM-DD HH:mm:ss"),
        //   moment(realEndTime.current).format("YYYY-MM-DD HH:mm:ss")
        // );
        if (ind.plotIndexOffset > plotAddedBy) {
          plotIndex.current += 1;
          plotAddedBy += 1;

          chart.current
            .plot(plotIndex.current)
            .legend()
            .itemsFormat(function () {
              var series = this.series;
              if (
                series.name() === ticker &&
                series.getType() === "candlestick"
              ) {
                return (
                  ticker +
                  " " +
                  (this.open ? "O" + this.open.toFixed(2) : "") +
                  (this.high ? "H" + this.high.toFixed(2) : "") +
                  (this.low ? "L" + this.low.toFixed(2) : "") +
                  (this.close ? "C" + this.close.toFixed(2) : "")
                );
              } else {
                return (
                  series.name() +
                  " " +
                  (this.value ? this.value.toFixed(2) : "")
                );
              }
            });
        }
        if (plotAddedBy > 0) charts[index].plotIndex = plotIndex.current;
      });
      if (annotations.length > 0) {
        indicator.annotations.forEach((anno, index) => {
          let annoMappings = allResult
            .filter((p, idx) => {
              if ("func" in anno.condition) {
                return idx < 1
                  ? true
                  : anno.condition.func(p, allResult[idx - 1]);
              }
              return p[anno.condition.column] === anno.condition.value;
            })
            .map((p) => {
              return {
                xAnchor: moment(p.date).valueOf(),
                valueAnchor: p[anno.parameters.valueAnchor],
                text:
                  "textParam" in anno.parameters
                    ? p[anno.parameters.textParam]
                    : anno.parameters.text,
                normal: {
                  fontColor: anno.parameters.fontColor,
                },
                hovered: {
                  fontColor: anno.parameters.fontColor,
                },
                selected: {
                  fontColor: anno.parameters.fontColor,
                },
              };
            });

          annoMappings.forEach((annoMapping) => {
            ////console.log(annotations[index]);
            annotations[index].annotationIndex.push(
              chart.current
                .plot(anno.plotIndex)
                .annotations()
                [anno.type](annoMapping)
                .background({
                  fill: anno.background.fill,
                  stroke: anno.background.stroke,
                })
                .allowEdit(false)
            );
          });
        });
      }

      dispatch(
        indicatorActions.addIndicator({
          indicator,
          charts,
          annotations,
        })
      );
    },
    [
      dispatch,
      ticker,
      interval,
      adjustDividend,
      realTime,
      plotIndex,
      startDate,
      endDate,
    ]
  );

  useEffect(() => {
    ////console.log("RUNNING");
    if (!data) return;
    let newStockData = data.quotes.map((p) => {
      return [
        moment(p.date).valueOf(),
        // moment(p.date).format("YYYY-MM-DD"),
        p.open,
        p.high,
        p.low,
        adjustDividend ? p.adjclose : p.close,
        p.volume,
      ];
    });
    ////console.log(newStockData);
    setStockData(newStockData);
    // dispatch(stockActions.setStockData(newStockData)) // not working
    exchangeTimeZone.current = {
      name: "Exchange",
      value: Number(data.meta.gmtoffset) / 3600,
    };

    if (Object.keys(timezone).length === 0) {
      setTimezone(exchangeTimeZone.current);
      ////console.log("triggered?");
    }

    anychart.format.outputTimezone(timezone.value * 60 * -1);
    chart.current = new anychart.stock(true);
    chartTable.current = anychart.data.table();
    chartTable.current.addData(newStockData);

    chartMapping.current = chartTable.current.mapAs({
      open: 1,
      high: 2,
      low: 3,
      close: 4,
    });

    chart.current.plot(0).candlestick(chartMapping.current).name(ticker);
    chart.current.tooltip(false);
    chart.current.crosshair().displayMode("float");
    const subtractUnit = scrollLeftTimeUnit(interval);
    let subtractValue = 0;
    const intervalChar = interval.charAt(interval.length - 1);
    if (intervalChar === "d") {
      subtractValue = 3;
    } else if (intervalChar === "k") {
      subtractValue = 12;
    } else if (intervalChar === "o") {
      subtractValue = 60;
    } else if (intervalChar === "h") {
      subtractValue = 10;
    } else if (intervalChar === "m") {
      subtractValue = 4;
    }
    ////console.log(intervalChar);
    ////console.log(subtractValue);
    ////console.log(subtractUnit);
    let startRange = moment(newStockData[newStockData.length - 1][0]).subtract(
      subtractValue,
      subtractUnit
    );
    let endRange = moment(newStockData[newStockData.length - 1][0]);
    ////console.log(startRange.valueOf());
    ////console.log(endRange.valueOf());
    chart.current.selectRange(
      moment().subtract(subtractValue, subtractUnit).valueOf(),
      moment().valueOf()
    );
    var max = getStockMax(newStockData, startRange, endRange);
    var min = getStockMin(newStockData, startRange, endRange);
    ////console.log(max);
    ////console.log(min);

    chart.current.plot(0).yScale().maximum(max.toFixed(2));
    chart.current.plot(0).yScale().minimum(min.toFixed(2));
    chart.current
      .crosshair()
      .yLabel()
      .format(function () {
        return this.rawValue.toFixed(2);
      });

    // anychart.format.inputDateTimeFormat("yyyy-MM-dd hh:mm:ss");

    chart.current
      .xScale()
      .maximumGap({ intervalsCount: 10, unitType: "weeks", unitCount: 1 });

    if (["m", "h"].includes(interval.charAt(interval.length - 1))) {
      chart.current
        .crosshair()
        .xLabel()
        .format("{%rawValue}{dateTimeFormat:yyyy MMM dd HH:mm:ss }");
    } else {
      chart.current
        .crosshair()
        .xLabel()
        .format("{%rawValue}{dateTimeFormat:yyyy MMM dd }");
    }

    chart.current
      .plot(0)
      .legend()
      .itemsFormat(function () {
        var series = this.series;
        if (series.name() === ticker && series.getType() === "candlestick") {
          return (
            ticker +
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

    let priceLineMarker = chart.current.plot(0).lineMarker();
    let priceMarkerColor =
      newStockData[newStockData.length - 1][4] >
      newStockData[newStockData.length - 2][4]
        ? "rgb(76, 175, 80)"
        : "rgb(255, 82, 82)";

    priceLineMarker.value(newStockData[newStockData.length - 1][4]);
    priceLineMarker.stroke({
      thickness: 2,
      color: priceMarkerColor,
      dash: "2 7",
    });

    var priceTextMarker = chart.current.plot(0).textMarker();
    priceTextMarker.axis(chart.current.plot(0).yAxis());
    priceTextMarker.value(newStockData[newStockData.length - 1][4]);
    priceTextMarker.text(newStockData[newStockData.length - 1][4].toFixed(2));
    priceTextMarker.align("left");
    priceTextMarker.anchor("right-center");
    priceTextMarker.background({
      fill: priceMarkerColor,
    });
    priceTextMarker.fontColor("#FFFFFF");

    return () => {
      if (chart.current) chart.current = null;
    };
  }, [
    data,
    ticker,
    adjustDividend,
    interval,
    timezone,
    startDate,
    endDate,
    realTime,
    initialPicked,
  ]);

  // useEffect(() => {
  //   const addInititalIndicators = async () => {
  //     for await (let indicator of initialPicked.indicators) {
  //       ////console.log(
  //         [
  //           ...indicators["Traditional Indicator"],
  //           ...indicators["Innovative Indicators"],
  //         ].find((ind) => ind.name === indicator)
  //       );
  //       dispatch(
  //         indicatorActions.addIndicator(
  //           [
  //             ...indicators["Traditional Indicator"],
  //             ...indicators["Innovative Indicators"],
  //           ].find((ind) => ind.name === indicator)
  //         )
  //       );
  //     }
  //   };

  //     addInititalIndicators();
  // }, [addIndicator, indicators, initialPicked, dispatch]);

  const changeInterval = useCallback(
    (interval) => {
      // setInterval(interval.value);
      ////console.log(interval.value);
      dispatch(stockActions.setStartDateEndDate(interval.value));
    },
    [dispatch]
  );

  const toggleRealTime = useCallback(() => {
    setRealTime((prev) => !prev);
  }, []);

  const changeTimeZone = useCallback((opt) => {
    if (opt.name === "Exchange") opt.value = exchangeTimeZone.current.value;
    if (opt.value === exchangeTimeZone.current.value) opt.name = "Exchange";
    anychart.format.outputTimezone(opt.value * 60 * -1);
    setTimezone(opt);
  }, []);

  // const addStockTool = useCallback(
  //   async (stockTool) => {
  //     if (stockTool.name === "Pivot Hi Lo") {
  //       await addFline(
  //         chart,
  //         interval,
  //         stockData,
  //         stockTool,
  //         ticker,
  //         adjustDividend,
  //         startDate,
  //         endDate
  //       );
  //       dispatch(indicatorActions.addStockTools(stockTool));
  //     }
  //   },
  //   [adjustDividend, dispatch, endDate, interval, startDate, stockData, ticker]
  // );

  const removeIndicator = useCallback(
    (ind, index_input) => {
      ////console.log(ind);

      var numOfCharts;
      var filterCharts;
      var indicatorIndex;
      var chartSeriesIndex;
      var indicatorChartNames;
      var seriesLength;

      var allPlots = ind.charts
        .map((ch) => ch.plotIndex)
        .filter((value, index, self) => self.indexOf(value) === index);

      allPlots.sort(function (a, b) {
        return b - a;
      });
      ////console.log(allPlots);

      for (let m = 0; m < allPlots.length; m++) {
        chartSeriesIndex = [];
        indicatorChartNames = ind.charts.map((ch) => ch.name);
        seriesLength = chart.current.plot(allPlots[m]).getSeriesCount();
        for (let i = seriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(allPlots[m]).getSeries(i)) {
            let seriesName = chart.current
              .plot(allPlots[m])
              .getSeries(i)
              .name();
            if (indicatorChartNames.includes(seriesName)) {
              chartSeriesIndex.push(i);
            }
          }
        }

        filterCharts = ind.charts.filter((ch) => ch.plotIndex === allPlots[m]);
        numOfCharts = filterCharts.length;

        indicatorIndex = [];
        for (let index = 0; index < numOfCharts; index++) {
          indicatorIndex.push(
            filterCharts[index].index +
              index +
              Math.max(0, numOfCharts * index_input - 1)
          );
        }
        chartSeriesIndex.reverse();
        for (let j = 0; j < indicatorIndex.length; j++) {
          chart.current
            .plot(allPlots[m])
            .removeSeries(chartSeriesIndex[indicatorIndex[j]]);
        }
        if (chart.current.plot(allPlots[m]).getSeriesCount() < 1) {
          chart.current.plot(allPlots[m]).dispose();
          plotIndex.current -= 1;
        }
        if (Math.max(...indicatorIndex) + 1 < Math.max(...chartSeriesIndex))
          dispatch(indicatorActions.resetIndicatorIndex(ind.name));
      }

      if ("annotations" in ind) {
        ind.annotations.forEach((anno, index) => {
          anno.annotationIndex.forEach((annoIndex) => {
            chart.current
              .plot(anno.plotIndex)
              .annotations()
              .removeAnnotation(annoIndex);
          });
        });
      }
    },
    [chart, dispatch]
  );

  const updateIndicator = useCallback(
    async (indicator, indicator_index) => {
      ////console.log(indicator);
      var annotations =
        "annotations" in indicator
          ? indicator.annotations.map((item) => ({
              ...item,
              annotationIndex: [...item.annotationIndex],
            }))
          : [];
      let apiInputParam = {};
      ////console.log(indicator.parameters);
      indicator.parameters.forEach((opt) => {
        apiInputParam[opt.name] =
          Number.isNaN(+opt.value) || typeof opt.value == "boolean"
            ? opt.value
            : +opt.value;
      });

      let allResult = await indicatorCallback(indicator.apiFunc, {
        ...apiInputParam,
        ticker,
        interval,
        adjustDividend,
        startDate: realStartTime.current,
        endDate: realEndTime.current,
        realTime,
      });
      var chartSeriesIndex;
      var indicatorChartNames;
      var seriesLength;
      var numOfCharts;
      var indicatorIndex;
      var filterCharts;
      var result_temp;

      var allPlots = indicator.charts
        .map((ch) => ch.plotIndex)
        .filter((value, index, self) => self.indexOf(value) === index);

      for (let m = 0; m < allPlots.length; m++) {
        chartSeriesIndex = [];
        indicatorChartNames = indicator.charts.map((ch) => ch.name);
        seriesLength = chart.current.plot(allPlots[m]).getSeriesCount();
        for (let i = seriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(allPlots[m]).getSeries(i)) {
            let seriesName = chart.current
              .plot(allPlots[m])
              .getSeries(i)
              .name();
            if (indicatorChartNames.includes(seriesName)) {
              chartSeriesIndex.push(i);
            }
          }
        }

        filterCharts = indicator.charts.filter((ch) => {
          if ("condition" in ch) {
            return (
              apiInputParam[ch.condition.parameter] === ch.condition.value &&
              ch.plotIndex === allPlots[m]
            );
          }
          return ch.plotIndex === allPlots[m];
        });
        numOfCharts = filterCharts.length;
        ////console.log(numOfCharts);

        indicatorIndex = [];

        for (let index = 0; index < numOfCharts; index++) {
          result_temp = [];
          for (let r = 0; r < allResult.length; r++) {
            if ("range" in filterCharts[index]) {
              ////console.log(filterCharts[index]);
              if (
                !(
                  r >=
                    allResult.length -
                      1 -
                      filterCharts[index].range.startOffset &&
                  r <=
                    allResult.length - 1 - filterCharts[index].range.endOffset
                )
              )
                continue;
            }
            result_temp.push([
              allResult[r].date,
              +allResult[r][filterCharts[index].column],
            ]);
          }
          ////console.log(result_temp);
          indicatorIndex.push({
            index:
              filterCharts[index].index +
              index +
              Math.max(0, numOfCharts * indicator_index - 1),
            result: result_temp,
          });
        }
        chartSeriesIndex.reverse();
        indicatorIndex.reverse();

        for (let j = 0; j < indicatorIndex.length; j++) {
          var table = anychart.data.table();
          ////console.log(indicatorIndex[j].result);
          table.addData(indicatorIndex[j].result);
          var mapping = table.mapAs();
          mapping.addField("value", 1);
          if (
            chart.current
              .plot(allPlots[m])
              .getSeries(
                chartSeriesIndex[indicatorIndex[j].index] - indicator_index
              )
          ) {
            chart.current
              .plot(allPlots[m])
              .getSeries(
                chartSeriesIndex[indicatorIndex[j].index] - indicator_index
              )
              .data(mapping);

            ////console.log("data is mapping");
          }
        }
      }

      if ("annotations" in indicator) {
        indicator.annotations.forEach((anno, index) => {
          anno.annotationIndex.forEach((annoIndex) => {
            chart.current
              .plot(anno.plotIndex)
              .annotations()
              .removeAnnotation(annoIndex);
          });

          indicator.annotations.forEach((anno, index) => {
            let annoMappings = allResult
              .filter((p, idx) => {
                if ("func" in anno.condition) {
                  return idx < 1
                    ? true
                    : anno.condition.func(p, allResult[idx - 1]);
                }
                return p[anno.condition.column] === anno.condition.value;
              })
              .map((p) => {
                return {
                  xAnchor: moment(p.date).valueOf(),
                  valueAnchor: p[anno.parameters.valueAnchor],
                  text:
                    "textParam" in anno.parameters
                      ? p[anno.parameters.text]
                      : anno.parameters.text,
                  normal: {
                    fontColor: anno.parameters.fontColor,
                  },
                  hovered: {
                    fontColor: anno.parameters.fontColor,
                  },
                  selected: {
                    fontColor: anno.parameters.fontColor,
                  },
                };
              });

            annoMappings.forEach((annoMapping) => {
              ////console.log(annotations[index]);
              annotations[index].annotationIndex.push(
                chart.current
                  .plot(anno.plotIndex)
                  .annotations()
                  [anno.type](annoMapping)
                  .background({
                    fill: anno.background.fill,
                    stroke: anno.background.stroke,
                  })
                  .allowEdit(false)
              );
            });
          });
        });

        dispatch(
          indicatorActions.setAnnotations({
            index: indicator_index,
            annotations,
          })
        );
      }

      // for removing or adding chart base on condition
      for (let k = 0; k < indicator.charts.length; k++) {
        if ("condition" in indicator.charts[k]) {
          seriesLength = chart.current
            .plot(indicator.charts[k].plotIndex)
            .getSeriesCount();
          let seriesIndex = -1;
          for (let i = seriesLength - 1 + 100; i > -1; i--) {
            if (
              chart.current.plot(indicator.charts[k].plotIndex).getSeries(i)
            ) {
              let seriesName = chart.current
                .plot(indicator.charts[k].plotIndex)
                .getSeries(i)
                .name();
              if (seriesName === indicator.charts[k].name) {
                seriesIndex = i;
              }
            }
          }
          let condResult;
          if (Array.isArray(indicator.charts[k].condition)) {
            condResult = indicator.charts[k].condition.reduce(
              (accumulator, currentCond) =>
                accumulator &&
                apiInputParam[currentCond.parameter] === currentCond.value,
              true
            );
            condResult = !condResult;
          } else {
            condResult =
              apiInputParam[indicator.charts[k].condition.parameter] !==
              indicator.charts[k].condition.value;
          }
          ////console.log(apiInputParam);
          ////console.log(condResult);
          if (condResult) {
            ////console.log(seriesIndex);
            if (seriesIndex > -1) {
              ////console.log(indicator.charts[k]);
              ////console.log(seriesIndex);
              chart.current
                .plot(indicator.charts[k].plotIndex)
                .removeSeries(seriesIndex);
              if (
                chart.current
                  .plot(indicator.charts[k].plotIndex)
                  .getSeriesCount() < 1
              ) {
                chart.current.plot(indicator.charts[k].plotIndex).dispose();
                plotIndex.current -= 1;
              }
              dispatch(
                indicatorActions.updateIndicatorPlot({
                  index: indicator_index,
                  chartIndex: k,
                  plotIndex: 0,
                })
              );
            }
          } else {
            ////console.log(seriesIndex);
            if (seriesIndex === -1) {
              ////console.log(seriesIndex);
              let allResult = await indicatorCallback(indicator.apiFunc, {
                ...apiInputParam,
                ticker,
                interval,
                adjustDividend,
                startDate: realStartTime.current,
                endDate: realEndTime.current,
                realTime,
              });
              let addResult = allResult.map((p) => {
                return [
                  moment(p.date).valueOf(),
                  p[indicator.charts[k].column] === null
                    ? null
                    : +p[indicator.charts[k].column],
                ];
              });
              table = anychart.data.table();
              table.addData(addResult);
              ////console.log(addResult);
              mapping = table.mapAs();
              mapping.addField("value", 1);
              let chartTemp = chart.current
                .plot(indicator.charts[k].plotIndexOffset + plotIndex.current)
                [indicator.charts[k].seriesType](mapping)
                ["name"](indicator.charts[k].name)
                [
                  indicator.charts[k].seriesType === "column"
                    ? "fill"
                    : "stroke"
                ](indicator.charts[k].stroke);

              if (indicator.charts[k].seriesType === "marker") {
                chartTemp.size(indicator.charts[k].size);
              }
              if ("markerType" in indicator.charts[k]) {
                chartTemp.type(indicator.charts[k].markerType);
              }

              if ("fill" in indicator.charts[k]) {
                chartTemp.fill(indicator.charts[k].fill);
              }
              chart.current
                .plot(0)
                .yScale()
                .maximum(Math.max([...addResult.map((p) => p[1])]).toFixed(2));
              chart.current
                .plot(0)
                .yScale()
                .minimum(Math.min([...addResult.map((p) => p[1])]).toFixed(2));

              dispatch(
                indicatorActions.updateIndicatorPlot({
                  index: indicator_index,
                  chartIndex: k,
                  plotIndex:
                    indicator.charts[k].plotIndexOffset + plotIndex.current,
                })
              );
              plotIndex.current += indicator.charts[k].plotIndexOffset;
            }
          }
        }
      }
    },
    [adjustDividend, dispatch, interval, realTime, ticker]
  );

  if (isFetching) return "Loading...";

  if (error) return "An error has occured:" + error.message;

  return (
    <Container fluid>
      <Row>
        <Col md={1}>
          <ChartToolBar chart={chart} />
        </Col>
        <Col>
          <ChartTopBar
            chart={chart}
            ticker={ticker}
            stockData={stockData}
            addIndicator={addIndicator}
            updateIndicator={updateIndicator}
            removeIndicator={removeIndicator}
            changeInterval={changeInterval}
            toggleRealTime={toggleRealTime}
            changeTimeZone={changeTimeZone}
            adjustDividend={adjustDividend}
            realStartTime={realStartTime}
            realEndTime={realEndTime}
            realTime={realTime}
            timezone={timezone}
            plotIndex={plotIndex}
            initialPicked={initialPicked}
          />
          <AnyChart
            id="stock-chart"
            width="100%"
            height="100%"
            instance={chart.current}
            title={ticker}
          />
          <ListenChart
            chart={chart}
            interval={interval}
            adjustDividend={adjustDividend}
            realTime={realTime}
            newStockData={stockData}
            ticker={ticker}
            initialPicked={initialPicked}
            addIndicator={addIndicator}
          />
          <IndicatorUpdate
            chart={chart}
            newStockData={stockData}
            plotIndex={plotIndex}
            interval={interval}
            adjustDividend={adjustDividend}
            realTime={realTime}
            ticker={ticker}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default TheChart;
