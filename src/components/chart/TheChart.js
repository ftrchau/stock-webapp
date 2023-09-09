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
import stockApi from "../../api/stock";

import annotationIndex from "../chart/annotationIndex";
import stockDataStore from "./stockDataStore";

import "./TheChart.css";

var allMax = Math.max(stockDataStore.FLineMax, stockDataStore.IntraATRMax);
var compareMin = [];
if (stockDataStore.FLineMin !== 0) compareMin.push(stockDataStore.FLineMin);
if (stockDataStore.IntraATRMin !== 0)
  compareMin.push(stockDataStore.IntraATRMin);
var allMin = Math.min(...compareMin);

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

const outputStockData = (apiResult, adjustDividend) => {
  return apiResult.quotes.map((p) => {
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

let realTimeIntervalId = null;

function TheChart(props) {
  ////console.log("function rerender??");
  const dispatch = useDispatch();

  const { ticker, initialPicked } = props;
  const startDate = useSelector((state) => state.stock.startDate);
  const endDate = useSelector((state) => state.stock.endDate);
  const interval = useSelector((state) => state.stock.interval);
  const realTime = useSelector((state) => state.stock.realTime);
  const tradingPeriod = useSelector((state) => state.stock.tradingPeriod);

  const [adjustDividend, setAdjustDividend] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [timezone, setTimezone] = useState({});

  const chart = useRef(null);
  const chartTable = useRef(null);
  const chartMapping = useRef(null);
  const exchangeTimeZone = useRef({});
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
      ////console.log("does addIndicator get called?");

      let apiInputParam = {};
      indicator.parameters.forEach((opt) => {
        apiInputParam[opt.name] =
          Number.isNaN(+opt.value) || typeof opt.value == "boolean"
            ? opt.value
            : +opt.value;
      });

      var charts = indicator.charts.map((item) => ({ ...item }));
      var annotations =
        "annotations" in indicator
          ? indicator.annotations.map((item) => ({
              ...item,
              annotationIndex: [...item.annotationIndex],
            }))
          : [];

      if (indicator.type === "custom") {
        if (indicator.name === "10AM Hi Lo fibo") {
          await stockDataStore.addIntraFline(
            chart.current,
            interval,
            stockData,
            indicator,
            ticker,
            adjustDividend,
            startDate,
            endDate,
            tradingPeriod
          );
        }
        if (indicator.name === "Fibo Lines") {
          await stockDataStore.addFbLine(
            chart.current,
            interval,
            stockData,
            indicator,
            ticker,
            adjustDividend,
            startDate,
            endDate
          );
        }
        if (indicator.name === "Volume Profile") {
          await stockDataStore.drawVolumeProfileFunction(
            indicator,
            chart,
            ticker,
            interval,
            adjustDividend,
            realTime
          );
        }
        if (indicator.name === "ATR lines on lower timeframe") {
          await stockDataStore.addIntraATR(
            chart,
            interval,
            indicator,
            ticker,
            adjustDividend,
            startDate,
            endDate,
            plotIndex
          );
        }
        dispatch(
          indicatorActions.addIndicator({
            indicator,
            charts,
            annotations,
          })
        );

        return;
      }

      let allResult = await indicatorCallback(indicator.apiFunc, {
        ...apiInputParam,
        ticker,
        interval,
        adjustDividend,
        startDate,
        endDate: ["1h", "1m", "2m", "5m", "15m", "30m", "60m", "90m"].includes(
          interval
        )
          ? moment().valueOf()
          : endDate,
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
        let addResultColumns;

        if ("range" in ind) {
          ////console.log(allResult);
          addResultColumns = allResult.filter(
            (value, index) =>
              index >= allResult.length - 1 - ind.range.startOffset &&
              index <= allResult.length - 1 - ind.range.endOffset
          );
          addResult = addResultColumns.map((p, index) => {
            return [
              moment(p.date).valueOf(),
              p[ind.column] ? +p[ind.column] : null,
            ];
          });
        } else {
          addResultColumns = allResult.filter((p) => p[ind.column]);

          addResult = addResultColumns.map((p, index) => {
            return [
              moment(p.date).valueOf(),
              // +p[ind.column],
              p[ind.column] ? +p[ind.column] : null,
            ];
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
        // table.addData(addResult);
        table.addData(addResult);
        ////console.log(addResult);
        var mapping = table.mapAs();
        mapping.addField("value", 1);
        let chartTemp;

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
              // if (!addResult[resultIndex - 1]) return;
              let prevValue = !addResult[resultIndex - 1]
                ? null
                : addResult[resultIndex - 1][1];

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
                            addResultColumns
                          )
                        : ind.stroke[i].conditions[j](
                            this,
                            resultIndex,
                            addResultColumns
                          );

                    // console.log(conditions_temp);
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
            [ind.seriesType](mapping);

          chartTemp["name"](ind.name)[
            ind.seriesType === "column" ? "fill" : "stroke"
          ](ind.stroke);
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
          let allResultFilter = allResult.filter((p, idx) => {
            if (!("condition" in anno)) {
              return p[anno.parameters.valueAnchor];
              // &&
              // ("secondValueAnchor" in anno.parameters
              //   ? allResult[idx + 1][anno.parameters.secondValueAnchor]
              //   : true)
            }
            if ("func" in anno.condition) {
              return idx < 1
                ? true
                : anno.condition.func(p, allResult[idx - 1]);
            }
            return p[anno.condition.column] === anno.condition.value;
          });
          let annoMappings = allResultFilter.map((p, idx) => {
            let annoObj = {
              fontSize: 10,
              xAnchor: moment(p.date).valueOf(),
              valueAnchor: p[anno.parameters.valueAnchor],
            };

            if (anno.type === "label") {
              annoObj = {
                ...annoObj,
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
                padding: 0,
              };
            }
            if (anno.type === "marker") {
              annoObj = {
                ...annoObj,
                markerType: anno.parameters.markerType,
                fill: anno.background.fill,
                stroke: anno.background.stroke,
              };
            }

            if (
              "secondValueAnchor" in anno.parameters &&
              idx < allResultFilter.length - 1
            ) {
              annoObj = {
                ...annoObj,
                secondXAnchor: moment(allResultFilter[idx + 1].date).valueOf(),
                secondValueAnchor:
                  allResultFilter[idx + 1][anno.parameters.secondValueAnchor],

                // stroke: {
                //   color: Array.isArray(anno.parameters.stroke) ? (anno.parameter.condition.reduce(
                //     (accumulator, currentCond) =>
                //       accumulator &&
                //       apiInputParam[currentCond.parameter] === currentCond.value,
                //     true
                //   ) ? "": ""): ""
                // }
              };
              if ("stroke" in anno.parameters) {
                if (Array.isArray(anno.parameters.stroke)) {
                  anno.parameters.stroke.forEach((stk) => {
                    if (stk.condition(idx, allResultFilter)) {
                      annoObj = {
                        ...annoObj,
                        stroke: {
                          color: stk.color,
                        },
                      };

                      return;
                    }
                  });
                } else {
                  annoObj = {
                    ...annoObj,
                    stroke: {
                      color: anno.parameters.stroke,
                    },
                  };
                }
              }
            }

            return annoObj;
          });

          annoMappings.forEach((annoMapping) => {
            ////console.log(annotations[index]);
            annotations[index].annotationIndex.push(
              chart.current
                .plot(anno.plotIndex)
                .annotations()
                [anno.type](annoMapping)
                .allowEdit(false)
              // .background({
              //   fill: anno.background.fill,
              //   stroke: anno.background.stroke,
              // })
            );
          });
        });
      }

      if ("yscale" in indicator) {
        let yscale_value;
        if (typeof indicator.yscale.value === "object") {
          // console.log(allResult);
          let range = chart.current.getSelectedRange();
          let visibleAllResult = allResult.filter((p) => {
            return (
              range.firstSelected <= moment(p.date).valueOf() &&
              range.lastSelected >= moment(p.date).valueOf()
            );
          });
          let column_values = [];
          // let current_compare;

          for (let s = 0; s < indicator.yscale.value.parameters.length; s++) {
            // column_values.concat(
            // visibleAllResult
            //   .filter((p) => p[indicator.yscale.value.parameters[s]])
            //   .map((p) => p[indicator.yscale.value.parameters[s]])
            // );
            column_values.push(
              indicator.yscale.type === "minimum"
                ? Math.min(
                    ...visibleAllResult
                      .filter((p) => p[indicator.yscale.value.parameters[s]])
                      .map((p) => p[indicator.yscale.value.parameters[s]])
                  )
                : Math.max(
                    ...visibleAllResult
                      .filter((p) => p[indicator.yscale.value.parameters[s]])
                      .map((p) => p[indicator.yscale.value.parameters[s]])
                  )
            );
          }

          yscale_value =
            indicator.yscale.type === "minimum"
              ? Math.min(...column_values) * 0.98
              : Math.max(...column_values) * 1.02;
        } else {
          yscale_value = indicator.yscale.value;
        }

        chart.current
          .plot(plotIndex.current)
          .yScale()
          [indicator.yscale.type](yscale_value);
      }

      console.log(indicator);

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
      stockData,
      tradingPeriod,
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
    stockDataStore.stockData = newStockData;

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

    ////console.log(subtractValue);
    ////console.log(subtractUnit);
    if (!moment().subtract(subtractValue, subtractUnit).isAfter(moment())) {
      ////console.log(moment().subtract(subtractValue, subtractUnit).valueOf());
      ////console.log(moment().valueOf());
      chart.current.selectRange(
        moment().subtract(subtractValue, subtractUnit).valueOf(),
        moment().valueOf()
      );
    }

    var max = Math.max(allMax, getStockMax(newStockData, startRange, endRange));
    var min = getStockMin(newStockData, startRange, endRange);

    if (allMin) min = Math.min(min, allMin);
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
    let unitType = "week";
    let interval_time_unit = intervalTimeUnit(interval);
    if (interval_time_unit === "minutes") {
      unitType = "hour";
    } else if (interval_time_unit === "hours") {
      unitType = "day";
    } else if (interval_time_unit === "days") {
      unitType = "week";
    } else if (interval_time_unit === "weeks") {
      unitType = "month";
    } else if (interval_time_unit === "months") {
      unitType = "year";
    }

    chart.current
      .xScale()
      .maximumGap({ intervalsCount: 20, unitType: unitType, unitCount: 1 });

    // if (["m", "h"].includes(interval.charAt(interval.length - 1))) {
    //   chart.current
    //     .crosshair()
    //     .xLabel()
    //     .format("{%rawValue}{dateTimeFormat:yyyy MMM dd HH:mm:ss }");
    // } else {
    //   chart.current
    //     .crosshair()
    //     .xLabel()
    //     .format("{%rawValue}{dateTimeFormat:yyyy MMM dd }");
    // }

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

    if (newStockData[newStockData.length - 1][4]) {
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
    }

    if (realTime) {
      realTimeIntervalId = setInterval(async () => {
        ////console.log("test realtime");
        if (
          moment(tradingPeriod.regularStart, moment.ISO_8601).isBefore(
            moment()
          ) &&
          moment(tradingPeriod.regularEnd, moment.ISO_8601).isAfter(moment())
        ) {
          let result = await stockApi.getStockPriceRealTime({
            ticker,
            startDate: moment(
              tradingPeriod.regularStart,
              moment.ISO_8601
            ).valueOf(),
            interval,
          });

          ////console.log(result);
          if (result) {
            let temp_output_realtime = outputStockData(result);
            stockDataStore.stockData.push(
              temp_output_realtime[temp_output_realtime.length - 1]
            );
            ////console.log(stockDataStore.stockData);

            chartTable.current.addData([
              temp_output_realtime[temp_output_realtime.length - 1],
            ]);

            chart.current
              .plot(0)
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

            // chart.current.plot(0).getSeries(0).data(stockDataStore.stockData);
            // startDate: moment(
            //   this.stockMeta.currentTradingPeriod.regular.start,
            //   moment.ISO_8601
            // ).valueOf()
          }
        }
      }, 60000);
    }

    return () => {
      if (chart.current) chart.current = null;
      if (realTimeIntervalId) {
        clearInterval(realTimeIntervalId);
        realTimeIntervalId = null;
      }
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
    tradingPeriod,
  ]);

  const addStockTool = useCallback(
    async (stockTool) => {
      ////console.log(stockTool);

      if (stockTool.name === "ATR lines on lower timeframe") {
        await stockDataStore.addIntraATR(
          chart,
          interval,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          plotIndex
        );
      }
      if (stockTool.name === "10AM Hi Lo fibo") {
        await stockDataStore.addIntraFline(
          chart.current,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          tradingPeriod
        );
      }
      dispatch(indicatorActions.addStockTools(stockTool));
    },
    [
      chart,
      stockData,
      dispatch,
      ticker,
      interval,
      adjustDividend,
      plotIndex,
      realTime,
      startDate,
      endDate,
      tradingPeriod,
    ]
  );

  const updateStockTool = useCallback(
    async (stockTool, index) => {
      if (stockTool.name === "Volume Profile") {
        ////console.log(annotationIndex.VolumeProfileannotationIndex);
        annotationIndex.VolumeProfileannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.VolumeProfileannotationIndex = [];

        // dispatch(indicatorActions.removeSelectedStockTool(index));
        // dispatch(indicatorActions.addStockTools(stockTool));
        await stockDataStore.drawVolumeProfileFunction(
          stockTool,
          chart,
          ticker,
          interval,
          adjustDividend,
          realTime
        );
      }
      if (stockTool.name === "Pivot Hi Lo") {
        await stockDataStore.addFline(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          true
        );
      }
      if (stockTool.name === "Fibo Lines") {
        annotationIndex.FLineannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.FLineannotationIndex = [];

        await stockDataStore.addFbLine(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          true
        );
      }
      if (stockTool.name === "52 Wk Hi Lo Range - Buy Sell") {
        await stockDataStore.addWkHiLo(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          plotIndex,
          true
        );
      }
      if (stockTool.name === "William Vix Fix Top Bottom detection") {
        await stockDataStore.addVIXTopBottom(
          chart,
          interval,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          plotIndex,
          true
        );
      }
      if (stockTool.name === "Cyclical KO") {
        await stockDataStore.addKO(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          plotIndex,
          true
        );
      }
      if (stockTool.name === "Linear Regression Channel on Pivot") {
        await stockDataStore.addLinearRegression(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          true
        );
      }
      if (stockTool.name === "Zig Zag + LR") {
        annotationIndex.ZigZagannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.ZigZagannotationIndex = [];
        await stockDataStore.addZigZag(
          chart.current,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          true
        );
      }
      if (stockTool.name === "ATR lines on lower timeframe") {
        annotationIndex.IntraATRannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.IntraATRannotationIndex = [];

        await stockDataStore.addIntraATR(
          chart,
          interval,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          plotIndex,
          true
        );
      }
      if (stockTool.name === "10AM Hi Lo fibo") {
        annotationIndex.IntraFlineannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.IntraFlineannotationIndex = [];
        await stockDataStore.addIntraFline(
          chart.current,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          tradingPeriod,
          true
        );
      }
    },
    [
      chart,
      interval,
      stockData,
      ticker,
      adjustDividend,
      startDate,
      endDate,
      plotIndex,
      realTime,
      tradingPeriod,
    ]
  );
  const removeStockTool = useCallback(
    (ind, index) => {
      if (ind.name === "Volume Profile") {
        annotationIndex.VolumeProfileannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.VolumeProfileannotationIndex = [];
        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
      if (ind.name === "Pivot Hi Lo") {
        var seriesLength = chart.current.plot(0).getSeriesCount();
        for (let i = seriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(0).getSeries(i)) {
            let seriesName = chart.current.plot(0).getSeries(i).name();
            if (seriesName === "Pivot High" || seriesName === "Pivot Low") {
              chart.current.plot(0).removeSeries(i);
            }
          }
        }

        let range = chart.current.getSelectedRange();
        let visibleStockData = stockData.filter((p) => {
          return range.firstSelected <= p[0] && range.lastSelected >= p[0];
        });

        let stockMax = visibleStockData.map((p) => p[2]);
        let stockMin = visibleStockData.map((p) => p[3]);
        stockDataStore.FLineMax = Math.max(...stockMax);
        stockDataStore.FLineMin = Math.min(...stockMin);

        chart.current
          .plot(0)
          .yScale()
          .maximum(stockDataStore.FLineMax.toFixed(2));
        chart.current
          .plot(0)
          .yScale()
          .minimum(stockDataStore.FLineMin.toFixed(2));

        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
      if (ind.name === "Fibo Lines") {
        annotationIndex.FLineannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.FLineannotationIndex = [];
        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
      if (ind.name === "52 Wk Hi Lo Range - Buy Sell") {
        var seriesLengthWkHi = chart.current
          .plot(stockDataStore.wkHiLoChartIndex)
          .getSeriesCount();
        for (let i = seriesLengthWkHi - 1 + 100; i > -1; i--) {
          if (
            chart.current.plot(stockDataStore.wkHiLoChartIndex).getSeries(i)
          ) {
            let seriesNameWkHi = chart.current
              .plot(stockDataStore.wkHiLoChartIndex)
              .getSeries(i)
              .name();
            if (
              seriesNameWkHi === "on High" ||
              seriesNameWkHi === "on Low" ||
              seriesNameWkHi === "UB" ||
              seriesNameWkHi === "LB" ||
              seriesNameWkHi === "Mid" ||
              seriesNameWkHi === "bline" ||
              seriesNameWkHi === "sline"
            ) {
              chart.current
                .plot(stockDataStore.wkHiLoChartIndex)
                .removeSeries(i);
            }
          }
        }

        if (
          chart.current.plot(stockDataStore.wkHiLoChartIndex).getSeriesCount() <
          1
        ) {
          chart.current.plot(stockDataStore.wkHiLoChartIndex).dispose();
          plotIndex.current -= 1;
        }

        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
      if (ind.name === "William Vix Fix Top Bottom detection") {
        var seriesLengthVIXTopBottom = chart.current
          .plot(stockDataStore.VIXTopBottomChartIndex)
          .getSeriesCount();
        for (let i = seriesLengthVIXTopBottom - 1 + 100; i > -1; i--) {
          if (
            chart.current
              .plot(stockDataStore.VIXTopBottomChartIndex)
              .getSeries(i)
          ) {
            let seriesNameVIXTopBottom = chart.current
              .plot(stockDataStore.VIXTopBottomChartIndex)
              .getSeries(i)
              .name();
            if (
              seriesNameVIXTopBottom === "wvf" ||
              seriesNameVIXTopBottom === "wvfr" ||
              seriesNameVIXTopBottom === "Historical Volatility"
            ) {
              chart.current
                .plot(stockDataStore.VIXTopBottomChartIndex)
                .removeSeries(i);
            }
          }
        }
        if (
          chart.current
            .plot(stockDataStore.VIXTopBottomChartIndex)
            .getSeriesCount() < 1
        ) {
          chart.current.plot(stockDataStore.VIXTopBottomChartIndex).dispose();
          plotIndex.current -= 1;
        }
        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
      if (ind.name === "Cyclical KO") {
        var seriesLengthKO = chart.current
          .plot(stockDataStore.kochartIndex)
          .getSeriesCount();
        for (let i = seriesLengthKO - 1 + 100; i > -1; i--) {
          if (chart.current.plot(stockDataStore.kochartIndex).getSeries(i)) {
            let seriesNameKO = chart.current
              .plot(stockDataStore.kochartIndex)
              .getSeries(i)
              .name();
            if (
              seriesNameKO === "KO1" ||
              seriesNameKO === "KO2" ||
              seriesNameKO === "KO3"
            ) {
              chart.current.plot(stockDataStore.kochartIndex).removeSeries(i);
            }
          }
        }

        if (
          chart.current.plot(stockDataStore.kochartIndex).getSeriesCount() < 1
        ) {
          chart.current.plot(stockDataStore.kochartIndex).dispose();
          plotIndex.current -= 1;
        }
        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
      if (ind.name === "Linear Regression Channel on Pivot") {
        var seriesLengthLinearRegression = chart.current
          .plot(0)
          .getSeriesCount();
        for (let i = seriesLengthLinearRegression - 1 + 100; i > -1; i--) {
          if (chart.current.plot(0).getSeries(i)) {
            let seriesNameLinearRegression = chart.current
              .plot(0)
              .getSeries(i)
              .name();
            if (
              seriesNameLinearRegression === "Upper Channel Line" ||
              seriesNameLinearRegression === "Middle Channel Line" ||
              seriesNameLinearRegression === "Lower Channel Line" ||
              seriesNameLinearRegression === "Pivot High" ||
              seriesNameLinearRegression === "Pivot Low"
            ) {
              chart.current.plot(0).removeSeries(i);
            }
          }
        }

        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
      if (ind.name === "Zig Zag + LR") {
        annotationIndex.ZigZagannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.ZigZagannotationIndex = [];
        dispatch(indicatorActions.removeSelectedStockTool(index));

        var zigZagSeriesLength = chart.current.plot(0).getSeriesCount();
        for (let i = zigZagSeriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(0).getSeries(i)) {
            let seriesName = chart.current.plot(0).getSeries(i).name();
            if (
              seriesName === "Upper Linear Regression Line" ||
              seriesName === "Median Linear Regression Line" ||
              seriesName === "Lower Linear Regression Line"
            ) {
              chart.current.plot(0).removeSeries(i);
            }
          }
        }
        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
      if (ind.name === "ATR lines on lower timeframe") {
        annotationIndex.IntraATRannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.IntraATRannotationIndex = [];
        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
      if (ind.name === "ATR lines on lower timeframe") {
        var intraATRseriesLength = chart.current.plot(0).getSeriesCount();
        for (let i = intraATRseriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(0).getSeries(i)) {
            let seriesNameIntraATR = chart.current.plot(0).getSeries(i).name();
            if (
              seriesNameIntraATR === "ftop" ||
              seriesNameIntraATR === "fbot" ||
              seriesNameIntraATR === "fmid" ||
              seriesNameIntraATR === "f10" ||
              seriesNameIntraATR === "f20" ||
              seriesNameIntraATR === "f30" ||
              seriesNameIntraATR === "f40" ||
              seriesNameIntraATR === "f60" ||
              seriesNameIntraATR === "f70" ||
              seriesNameIntraATR === "f80" ||
              seriesNameIntraATR === "f90"
            ) {
              chart.current.plot(0).removeSeries(i);
            }
          }
        }

        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
      if (ind.name === "10AM Hi Lo fibo") {
        annotationIndex.IntraFlineannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.IntraFlineannotationIndex = [];
        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
    },
    [chart, stockData, dispatch, plotIndex]
  );

  const toggleRealTime = useCallback(() => {
    dispatch(stockActions.setRealTime(!realTime));
    // if (!realTime) {
    // if (
    //   moment(tradingPeriod.regularStart, moment.ISO_8601).isBefore(moment()) &&
    //   moment(tradingPeriod.regularEnd, moment.ISO_8601).isAfter(moment())
    // ) {
    console.log(moment(tradingPeriod.regularStart, moment.ISO_8601));
    console.log(moment());
    dispatch(indicatorActions.setNeedUpdate(true));
    // }
    // }
  }, [dispatch, realTime, tradingPeriod]);

  const changeTimeZone = useCallback((opt) => {
    if (opt.name === "Exchange") opt.value = exchangeTimeZone.current.value;
    if (opt.value === exchangeTimeZone.current.value) opt.name = "Exchange";
    anychart.format.outputTimezone(opt.value * 60 * -1);
    setTimezone(opt);
  }, []);

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

      if (ind.type === "custom") {
        if (ind.name === "Fibo Lines") {
          annotationIndex.FLineannotationIndex.forEach((elem) => {
            chart.current.plot(0).annotations().removeAnnotation(elem);
          });
          annotationIndex.FLineannotationIndex = [];
        }

        if (ind.name === "Volume Profile") {
          annotationIndex.VolumeProfileannotationIndex.forEach((elem) => {
            chart.current.plot(0).annotations().removeAnnotation(elem);
          });
          annotationIndex.VolumeProfileannotationIndex = [];
        }
        if (ind.name === "10AM Hi Lo fibo") {
          annotationIndex.IntraFlineannotationIndex.forEach((elem) => {
            chart.current.plot(0).annotations().removeAnnotation(elem);
          });
          annotationIndex.IntraFlineannotationIndex = [];
        }
        if (ind.name === "ATR lines on lower timeframe") {
          annotationIndex.IntraATRannotationIndex.forEach((elem) => {
            chart.current.plot(0).annotations().removeAnnotation(elem);
          });
          annotationIndex.IntraATRannotationIndex = [];

          var intraATRseriesLength = chart.current.plot(0).getSeriesCount();
          for (let i = intraATRseriesLength - 1 + 100; i > -1; i--) {
            if (chart.current.plot(0).getSeries(i)) {
              let seriesNameIntraATR = chart.current
                .plot(0)
                .getSeries(i)
                .name();
              if (
                seriesNameIntraATR === "ftop" ||
                seriesNameIntraATR === "fbot" ||
                seriesNameIntraATR === "fmid" ||
                seriesNameIntraATR === "f10" ||
                seriesNameIntraATR === "f20" ||
                seriesNameIntraATR === "f30" ||
                seriesNameIntraATR === "f40" ||
                seriesNameIntraATR === "f60" ||
                seriesNameIntraATR === "f70" ||
                seriesNameIntraATR === "f80" ||
                seriesNameIntraATR === "f90"
              ) {
                chart.current.plot(0).removeSeries(i);
              }
            }
          }
        }

        dispatch(indicatorActions.resetIndicatorChartPlot(index_input));
      }
      ////console.log(allPlots);
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

        // filterCharts = ind.charts.filter((ch) => ch.plotIndex === allPlots[m]);
        // numOfCharts = filterCharts.length;

        // indicatorIndex = [];
        // for (let index = 0; index < numOfCharts; index++) {
        //   indicatorIndex.push(
        //     filterCharts[index].index +
        //       index +
        //       Math.max(0, numOfCharts * index_input - 1)
        //   );
        // }
        // chartSeriesIndex.reverse();
        // for (let j = 0; j < indicatorIndex.length; j++) {
        //   chart.current
        //     .plot(allPlots[m])
        //     .removeSeries(chartSeriesIndex[indicatorIndex[j]]);
        // }
        for (let j = 0; j < chartSeriesIndex.length; j++) {
          chart.current.plot(allPlots[m]).removeSeries(chartSeriesIndex[j]);
        }

        console.log(allPlots[m]);
        console.log(chart.current.plot(allPlots[m]).getSeriesCount());
        if (chart.current.plot(allPlots[m]).getSeriesCount() < 1) {
          console.log("cond is satisfied");
          chart.current.plot(allPlots[m]).dispose();
          plotIndex.current -= 1;
        }
        // console.log(indicatorIndex);
        console.log(chartSeriesIndex);
        // if (Math.max(...indicatorIndex) + 1 < Math.max(...chartSeriesIndex)) {
        //   console.log("call reset indicator index");
        //   dispatch(indicatorActions.resetIndicatorIndex(ind.name));
        // }
        dispatch(indicatorActions.resetIndicatorChartPlot(index_input));
      }
    },
    [chart, dispatch]
  );

  const updateIndicator = useCallback(
    async (indicator, indicator_index) => {
      ////console.log(indicator);
      if (indicator.type === "custom") {
        if (indicator.name === "Fibo Lines") {
          annotationIndex.FLineannotationIndex.forEach((elem) => {
            chart.current.plot(0).annotations().removeAnnotation(elem);
          });
          annotationIndex.FLineannotationIndex = [];

          await stockDataStore.addFbLine(
            chart.current,
            interval,
            stockData,
            indicator,
            ticker,
            adjustDividend,
            startDate,
            endDate,
            true
          );
        }

        if (indicator.name === "Volume Profile") {
          annotationIndex.VolumeProfileannotationIndex.forEach((elem) => {
            chart.current.plot(0).annotations().removeAnnotation(elem);
          });
          annotationIndex.VolumeProfileannotationIndex = [];

          await stockDataStore.drawVolumeProfileFunction(
            indicator,
            chart,
            ticker,
            interval,
            adjustDividend,
            realTime
          );
        }
        if (indicator.name === "10AM Hi Lo fibo") {
          annotationIndex.IntraFlineannotationIndex.forEach((elem) => {
            chart.current.plot(0).annotations().removeAnnotation(elem);
          });
          annotationIndex.IntraFlineannotationIndex = [];
          await stockDataStore.addIntraFline(
            chart.current,
            interval,
            stockData,
            indicator,
            ticker,
            adjustDividend,
            startDate,
            endDate,
            tradingPeriod,
            true
          );
        }
        if (indicator.name === "ATR lines on lower timeframe") {
          annotationIndex.IntraATRannotationIndex.forEach((elem) => {
            chart.current.plot(0).annotations().removeAnnotation(elem);
          });
          annotationIndex.IntraATRannotationIndex = [];

          await stockDataStore.addIntraATR(
            chart,
            interval,
            indicator,
            ticker,
            adjustDividend,
            startDate,
            endDate,
            plotIndex,
            true
          );
        }

        return;
      }

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
        startDate,
        endDate,
        realTime,
      });

      var chartSeriesIndex;
      var indicatorChartNames;
      var seriesLength;
      var numOfCharts;
      var indicatorIndex;
      var filterCharts;
      var result_temp;
      var mapping;
      var table;

      var allPlots = indicator.charts
        .map((ch) => ch.plotIndex)
        .filter((value, index, self) => self.indexOf(value) === index);

      for (let m = 0; m < allPlots.length; m++) {
        chartSeriesIndex = [];

        filterCharts = indicator.charts.filter((ch) => {
          if ("condition" in ch) {
            return (
              apiInputParam[ch.condition.parameter] === ch.condition.value &&
              ch.plotIndex === allPlots[m]
            );
          }
          return ch.plotIndex === allPlots[m];
        });
        // indicatorChartNames = filterCharts.map((ch) => ch.name);
        seriesLength = chart.current.plot(allPlots[m]).getSeriesCount();
        for (let i = seriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(allPlots[m]).getSeries(i)) {
            let seriesName = chart.current
              .plot(allPlots[m])
              .getSeries(i)
              .name();
            for (let j = 0; j < filterCharts.length; j++) {
              if (seriesName === filterCharts[j].name) {
                chartSeriesIndex.push({
                  ...filterCharts[j],
                  seriesIndex: i,
                });
              }
            }
            // if (indicatorChartNames.includes(seriesName)) {
            //   // chartSeriesIndex.push(i);
            //   chartSeriesIndex.push({

            //   });
            // }
          }
        }
        for (let j = 0; j < chartSeriesIndex.length; j++) {
          result_temp = [];
          for (let r = 0; r < allResult.length; r++) {
            if ("range" in chartSeriesIndex[j]) {
              ////console.log(filterCharts[index]);
              if (
                !(
                  r >=
                    allResult.length -
                      1 -
                      chartSeriesIndex[j].range.startOffset &&
                  r <=
                    allResult.length - 1 - chartSeriesIndex[j].range.endOffset
                )
              )
                continue;
            }
            if (!allResult[r][chartSeriesIndex[j].column]) continue;
            result_temp.push([
              allResult[r].date,
              +allResult[r][chartSeriesIndex[j].column],
            ]);
          }
          ////console.log(result_temp);
          // indicatorIndex.push({
          //   index:
          //     filterCharts[index].index +
          //     index +
          //     Math.max(0, numOfCharts * indicator_index - 1),
          //   result: result_temp,
          // });
          table = anychart.data.table();
          table.addData(result_temp);
          mapping = table.mapAs();
          mapping.addField("value", 1);
          chart.current
            .plot(allPlots[m])
            .getSeries(chartSeriesIndex[j].seriesIndex)
            .data(mapping);
        }
      }

      // numOfCharts = filterCharts.length;
      // ////console.log(numOfCharts);

      // indicatorIndex = [];

      // for (let index = 0; index < numOfCharts; index++) {
      //   result_temp = [];
      //   for (let r = 0; r < allResult.length; r++) {
      //     if ("range" in filterCharts[index]) {
      //       ////console.log(filterCharts[index]);
      //       if (
      //         !(
      //           r >=
      //             allResult.length -
      //               1 -
      //               filterCharts[index].range.startOffset &&
      //           r <=
      //             allResult.length - 1 - filterCharts[index].range.endOffset
      //         )
      //       )
      //         continue;
      //     }
      //     result_temp.push([
      //       allResult[r].date,
      //       +allResult[r][filterCharts[index].column],
      //     ]);
      //   }
      //   ////console.log(result_temp);
      //   indicatorIndex.push({
      //     index:
      //       filterCharts[index].index +
      //       index +
      //       Math.max(0, numOfCharts * indicator_index - 1),
      //     result: result_temp,
      //   });
      // }

      // chartSeriesIndex.reverse();
      // indicatorIndex.reverse();

      // for (let j = 0; j < indicatorIndex.length; j++) {
      //   var table = anychart.data.table();
      //   ////console.log(indicatorIndex[j].result);
      //   table.addData(indicatorIndex[j].result);
      //   var mapping = table.mapAs();
      //   mapping.addField("value", 1);
      //   if (
      //     chart.current
      //       .plot(allPlots[m])
      //       .getSeries(
      //         chartSeriesIndex[indicatorIndex[j].index] - indicator_index
      //       )
      //   ) {
      //     chart.current
      //       .plot(allPlots[m])
      //       .getSeries(
      //         chartSeriesIndex[indicatorIndex[j].index] - indicator_index
      //       )
      //       .data(mapping);

      //     ////console.log("data is mapping");
      //   }
      // }
      // }

      if ("annotations" in indicator) {
        indicator.annotations.forEach((anno, index) => {
          anno.annotationIndex.forEach((annoIndex) => {
            chart.current
              .plot(anno.plotIndex)
              .annotations()
              .removeAnnotation(annoIndex);
          });

          indicator.annotations.forEach((anno, index) => {
            let allResultFilter = allResult.filter((p, idx) => {
              if (!("condition" in anno)) {
                return p[anno.parameters.valueAnchor];
              }
              if ("func" in anno.condition) {
                return idx < 1
                  ? true
                  : anno.condition.func(p, allResult[idx - 1]);
              }
              return p[anno.condition.column] === anno.condition.value;
            });
            let annoMappings = allResultFilter.map((p, idx) => {
              let annoObj = {
                fontSize: 10,
                xAnchor: moment(p.date).valueOf(),
                valueAnchor: p[anno.parameters.valueAnchor],
              };

              if (anno.type === "label") {
                annoObj = {
                  ...annoObj,
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
              }
              if (anno.type === "marker") {
                annoObj = {
                  ...annoObj,
                  markerType: anno.parameters.markerType,
                  fill: anno.background.fill,
                  stroke: anno.background.stroke,
                };
              }

              if (
                "secondValueAnchor" in anno.parameters &&
                idx < allResultFilter.length - 1
              ) {
                annoObj = {
                  ...annoObj,
                  secondXAnchor: moment(
                    allResultFilter[idx + 1].date
                  ).valueOf(),
                  secondValueAnchor:
                    allResultFilter[idx + 1][anno.parameters.secondValueAnchor],
                };
                if ("stroke" in anno.parameters) {
                  if (Array.isArray(anno.parameters.stroke)) {
                    anno.parameters.stroke.forEach((stk) => {
                      if (stk.condition(idx, allResultFilter)) {
                        annoObj = {
                          ...annoObj,
                          stroke: {
                            color: stk.color,
                          },
                        };

                        return;
                      }
                    });
                  } else {
                    annoObj = {
                      ...annoObj,
                      stroke: {
                        color: anno.parameters.stroke,
                      },
                    };
                  }
                }
              }

              return annoObj;
            });

            annoMappings.forEach((annoMapping) => {
              ////console.log(annotations[index]);
              annotations[index].annotationIndex.push(
                chart.current
                  .plot(anno.plotIndex)
                  .annotations()
                  [anno.type](annoMapping)
                  .allowEdit(false)
                // .background({
                //   fill: anno.background.fill,
                //   stroke: anno.background.stroke,
                // })
              );
            });
          });
        });

        if ("yscale" in indicator) {
          let yscale_value;
          if (typeof indicator.yscale.value === "object") {
            // console.log(allResult);
            let range = chart.current.getSelectedRange();
            let visibleAllResult = allResult.filter((p) => {
              return (
                range.firstSelected <= moment(p.date).valueOf() &&
                range.lastSelected >= moment(p.date).valueOf()
              );
            });
            let column_values = [];
            // let current_compare;

            for (let s = 0; s < indicator.yscale.value.parameters.length; s++) {
              // column_values.concat(
              // visibleAllResult
              //   .filter((p) => p[indicator.yscale.value.parameters[s]])
              //   .map((p) => p[indicator.yscale.value.parameters[s]])
              // );
              column_values.push(
                indicator.yscale.type === "minimum"
                  ? Math.min(
                      ...visibleAllResult
                        .filter((p) => p[indicator.yscale.value.parameters[s]])
                        .map((p) => p[indicator.yscale.value.parameters[s]])
                    )
                  : Math.max(
                      ...visibleAllResult
                        .filter((p) => p[indicator.yscale.value.parameters[s]])
                        .map((p) => p[indicator.yscale.value.parameters[s]])
                    )
              );
            }

            yscale_value =
              indicator.yscale.type === "minimum"
                ? Math.min(...column_values) * 0.98
                : Math.max(...column_values) * 1.02;
          } else {
            yscale_value = indicator.yscale.value;
          }

          chart.current
            .plot(plotIndex.current)
            .yScale()
            [indicator.yscale.type](yscale_value);
        }
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
          let chartTemp;
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
                startDate,
                endDate,
                realTime,
              });
              let addResult;
              let addResultColumns;

              if ("range" in indicator) {
                addResultColumns = allResult.filter(
                  (value, index) =>
                    index >= allResult.length - 1 - indicator.range.startOffset &&
                    index <= allResult.length - 1 - indicator.range.endOffset
                );
                addResult = addResultColumns.map((p, index) => {
                  return [
                    moment(p.date).valueOf(),
                    p[indicator.column] ? +p[indicator.column] : null,
                  ];
                });
              } else {
                addResultColumns = allResult.filter((p) => p[indicator.column]);

                addResult = addResultColumns.map((p, index) => {
                  return [
                    moment(p.date).valueOf(),
                    // +p[ind.column],
                    p[indicator.column] ? +p[indicator.column] : null,
                  ];
                });
              }
            
              table = anychart.data.table();
              table.addData(addResult);
              ////console.log(addResult);
              mapping = table.mapAs();
              mapping.addField("value", 1);
              if (Array.isArray(indicator.charts[k].stroke)) {
                chartTemp = chart.current
                  .plot(indicator.charts[k].plotIndexOffset + plotIndex.current)
                  [indicator.charts[k].seriesType](mapping)
                  ["name"](indicator.charts[k].name)
                  [
                    indicator.charts[k].seriesType === "column"
                      ? "fill"
                      : "stroke"
                  ](function () {
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
                    let prevValue = !addResult[resultIndex - 1]
                      ? null
                      : addResult[resultIndex - 1][1];

                    let strokeColor = "";
                    let conditions_temp = "";
                    // ////console.log("is this still affecting??");

                    for (
                      let i = 0;
                      i < indicator.charts[k].stroke.length;
                      i++
                    ) {
                      conditions_temp = "";
                      for (
                        let j = 0;
                        j < indicator.charts[k].stroke[i].conditions.length;
                        j++
                      ) {
                        // conditions_temp = "";
                        if (
                          typeof indicator.charts[k].stroke[i].conditions[j] ===
                          "string"
                        ) {
                          if (
                            indicator.charts[k].stroke[i].conditions[j] ===
                            "positive"
                          ) {
                            conditions_temp =
                              conditions_temp === ""
                                ? this.value >= 0
                                : conditions_temp && this.value >= 0;
                          }
                          if (
                            indicator.charts[k].stroke[i].conditions[j] ===
                            "negative"
                          ) {
                            conditions_temp =
                              conditions_temp === ""
                                ? this.value < 0
                                : conditions_temp && this.value < 0;
                          }
                          if (
                            indicator.charts[k].stroke[i].conditions[j] ===
                            "increase"
                          ) {
                            conditions_temp =
                              conditions_temp === ""
                                ? this.value > prevValue
                                : conditions_temp && this.value > prevValue;
                          }
                          if (
                            indicator.charts[k].stroke[i].conditions[j] ===
                            "decrease"
                          ) {
                            conditions_temp =
                              conditions_temp === ""
                                ? this.value < prevValue
                                : conditions_temp && this.value < prevValue;
                          }
                        } else {
                          conditions_temp =
                            conditions_temp === ""
                              ? indicator.charts[k].stroke[i].conditions[j](
                                  this,
                                  resultIndex,
                                  addResultColumns
                                )
                              : indicator.charts[k].stroke[i].conditions[j](
                                  this,
                                  resultIndex,
                                  addResultColumns
                                );
                        }
                      }
                      if (conditions_temp) {
                        strokeColor = indicator.charts[k].stroke[i].color;
                        break;
                      }
                    }

                    if (conditions_temp) {
                      return strokeColor;
                    } else {
                      if ("defaultStroke" in indicator.charts[k]) {
                        return indicator.charts[k].stroke.defaultStroke;
                      }
                    }

                    return this.sourceColor;
                  });
              } else {
                chartTemp = chart.current
                  .plot(indicator.charts[k].plotIndexOffset + plotIndex.current)
                  [indicator.charts[k].seriesType](mapping);

                chartTemp["name"](indicator.charts[k].name)[
                  indicator.charts[k].seriesType === "column"
                    ? "fill"
                    : "stroke"
                ](indicator.charts[k].stroke);
              }

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
    [
      adjustDividend,
      dispatch,
      interval,
      realTime,
      ticker,
      startDate,
      endDate,
      stockData,
    ]
  );

  const showIndicator = useCallback(
    (indIndex, indicator) => {
      console.log(indIndex);
      for (let k = 0; k < indicator.charts.length; k++) {
        let seriesLength = chart.current
          .plot(indicator.charts[k].plotIndex)
          .getSeriesCount();
        for (let i = seriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(indicator.charts[k].plotIndex).getSeries(i)) {
            let seriesName = chart.current
              .plot(indicator.charts[k].plotIndex)
              .getSeries(i)
              .name();
            if (seriesName === indicator.charts[k].name) {
              chart.current
                .plot(indicator.charts[k].plotIndex)
                .getSeries(i)
                .enabled(true);
            }
          }
        }
      }
      if ("annotations" in indicator) {
        for (let j = 0; j < indicator.annotations.length; j++) {
          if ("annotationIndex" in indicator.annotations[j]) {
            for (
              let k = 0;
              k < indicator.annotations[j].annotationIndex.length;
              k++
            ) {
              indicator.annotations[j].annotationIndex[k].enabled(true);
            }
          }
        }
      }
      dispatch(
        indicatorActions.toggleShowIndicator({
          index: indIndex,
          hide: false,
        })
      );
    },
    [dispatch]
  );
  const hideIndicator = useCallback(
    (indIndex, indicator) => {
      console.log(indIndex);
      for (let k = 0; k < indicator.charts.length; k++) {
        let seriesLength = chart.current
          .plot(indicator.charts[k].plotIndex)
          .getSeriesCount();
        for (let i = seriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(indicator.charts[k].plotIndex).getSeries(i)) {
            let seriesName = chart.current
              .plot(indicator.charts[k].plotIndex)
              .getSeries(i)
              .name();
            if (seriesName === indicator.charts[k].name) {
              chart.current
                .plot(indicator.charts[k].plotIndex)
                .getSeries(i)
                .enabled(false);
            }
          }
        }
      }
      if ("annotations" in indicator) {
        for (let j = 0; j < indicator.annotations.length; j++) {
          if ("annotationIndex" in indicator.annotations[j]) {
            for (
              let k = 0;
              k < indicator.annotations[j].annotationIndex.length;
              k++
            ) {
              indicator.annotations[j].annotationIndex[k].enabled(false);
            }
          }
        }
      }
      dispatch(
        indicatorActions.toggleShowIndicator({
          index: indIndex,
          hide: true,
        })
      );
    },
    [dispatch]
  );

  const showStockTool = useCallback(
    (toolIndex, stockTool) => {
      console.log(toolIndex);
      var seriesLength;
      if (stockTool.name === "Volume Profile") {
        annotationIndex.VolumeProfileannotationIndex.forEach((elem) => {
          elem.enabled(true);
        });
      }
      if (stockTool.name === "Pivot Hi Lo") {
        seriesLength = chart.current.plot(0).getSeriesCount();
        for (let i = seriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(0).getSeries(i)) {
            let seriesName = chart.current.plot(0).getSeries(i).name();
            if (seriesName === "Pivot High" || seriesName === "Pivot Low") {
              chart.current.plot(0).getSeries(i).enabled(true);
            }
          }
        }
      }
      if (stockTool.name === "Fibo Lines") {
        annotationIndex.FLineannotationIndex.forEach((elem) => {
          elem.enabled(true);
        });
      }
      if (stockTool.name === "52 Wk Hi Lo Range - Buy Sell") {
        var seriesLengthWkHi = chart.current
          .plot(stockDataStore.wkHiLoChartIndex)
          .getSeriesCount();
        for (let i = seriesLengthWkHi - 1 + 100; i > -1; i--) {
          if (
            chart.current.plot(stockDataStore.wkHiLoChartIndex).getSeries(i)
          ) {
            let seriesNameWkHi = chart.current
              .plot(stockDataStore.wkHiLoChartIndex)
              .getSeries(i)
              .name();
            if (
              seriesNameWkHi === "on High" ||
              seriesNameWkHi === "on Low" ||
              seriesNameWkHi === "UB" ||
              seriesNameWkHi === "LB" ||
              seriesNameWkHi === "Mid" ||
              seriesNameWkHi === "bline" ||
              seriesNameWkHi === "sline"
            ) {
              chart.current
                .plot(stockDataStore.wkHiLoChartIndex)
                .getSeries(i)
                .enabled(true);
            }
          }
        }
      }
      if (stockTool.name === "William Vix Fix Top Bottom detection") {
        var seriesLengthVIXTopBottom = chart.current
          .plot(stockDataStore.VIXTopBottomChartIndex)
          .getSeriesCount();
        for (let i = seriesLengthVIXTopBottom - 1 + 100; i > -1; i--) {
          if (
            chart.current
              .plot(stockDataStore.VIXTopBottomChartIndex)
              .getSeries(i)
          ) {
            let seriesNameVIXTopBottom = chart.current
              .plot(stockDataStore.VIXTopBottomChartIndex)
              .getSeries(i)
              .name();
            if (
              seriesNameVIXTopBottom === "wvf" ||
              seriesNameVIXTopBottom === "wvfr" ||
              seriesNameVIXTopBottom === "Historical Volatility"
            ) {
              chart.current
                .plot(stockDataStore.VIXTopBottomChartIndex)
                .getSeries(i)
                .enabled(true);
            }
          }
        }
      }
      if (stockTool.name === "Cyclical KO") {
        var seriesLengthKO = chart.current
          .plot(stockDataStore.kochartIndex)
          .getSeriesCount();
        for (let i = seriesLengthKO - 1 + 100; i > -1; i--) {
          if (chart.current.plot(stockDataStore.kochartIndex).getSeries(i)) {
            let seriesNameKO = chart.current
              .plot(stockDataStore.kochartIndex)
              .getSeries(i)
              .name();
            if (
              seriesNameKO === "KO1" ||
              seriesNameKO === "KO2" ||
              seriesNameKO === "KO3"
            ) {
              chart.current
                .plot(stockDataStore.kochartIndex)
                .getSeries(i)
                .enabled(true);
            }
          }
        }
      }
      if (stockTool.name === "Linear Regression Channel on Pivot") {
        var seriesLengthLinearRegression = chart.current
          .plot(0)
          .getSeriesCount();
        for (let i = seriesLengthLinearRegression - 1 + 100; i > -1; i--) {
          if (chart.current.plot(0).getSeries(i)) {
            let seriesNameLinearRegression = chart.current
              .plot(0)
              .getSeries(i)
              .name();
            if (
              seriesNameLinearRegression === "Upper Channel Line" ||
              seriesNameLinearRegression === "Middle Channel Line" ||
              seriesNameLinearRegression === "Lower Channel Line" ||
              seriesNameLinearRegression === "Pivot High" ||
              seriesNameLinearRegression === "Pivot Low"
            ) {
              chart.current.plot(0).getSeries(i).enabled(true);
            }
          }
        }
      }
      if (stockTool.name === "Zig Zag + LR") {
        annotationIndex.ZigZagannotationIndex.forEach((elem) => {
          elem.enabled(true);
        });

        var zigZagSeriesLength = chart.current.plot(0).getSeriesCount();
        for (let i = zigZagSeriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(0).getSeries(i)) {
            let seriesName = chart.current.plot(0).getSeries(i).name();
            if (
              seriesName === "Upper Linear Regression Line" ||
              seriesName === "Median Linear Regression Line" ||
              seriesName === "Lower Linear Regression Line"
            ) {
              chart.current.plot(0).getSeries(i).enabled(true);
            }
          }
        }
      }
      if (stockTool.name === "ATR lines on lower timeframe") {
        annotationIndex.IntraATRannotationIndex.forEach((elem) => {
          elem.enabled(true);
        });

        var intraATRseriesLength = chart.current.plot(0).getSeriesCount();
        for (let i = intraATRseriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(0).getSeries(i)) {
            let seriesNameIntraATR = chart.current.plot(0).getSeries(i).name();
            if (
              seriesNameIntraATR === "ftop" ||
              seriesNameIntraATR === "fbot" ||
              seriesNameIntraATR === "fmid" ||
              seriesNameIntraATR === "f10" ||
              seriesNameIntraATR === "f20" ||
              seriesNameIntraATR === "f30" ||
              seriesNameIntraATR === "f40" ||
              seriesNameIntraATR === "f60" ||
              seriesNameIntraATR === "f70" ||
              seriesNameIntraATR === "f80" ||
              seriesNameIntraATR === "f90"
            ) {
              chart.current.plot(0).getSeries(i).enabled(true);
            }
          }
        }
      }
      if (stockTool.name === "10AM Hi Lo fibo") {
        annotationIndex.IntraFlineannotationIndex.forEach((elem) => {
          elem.enabled(true);
        });
      }
      dispatch(
        indicatorActions.toggleShowStockTool({
          index: toolIndex,
          hide: false,
        })
      );
    },
    [dispatch]
  );
  const hideStockTool = useCallback((toolIndex, stockTool) => {
    var seriesLength;
    if (stockTool.name === "Volume Profile") {
      annotationIndex.VolumeProfileannotationIndex.forEach((elem) => {
        elem.enabled(false);
      });
    }
    if (stockTool.name === "Pivot Hi Lo") {
      seriesLength = chart.current.plot(0).getSeriesCount();
      for (let i = seriesLength - 1 + 100; i > -1; i--) {
        if (chart.current.plot(0).getSeries(i)) {
          let seriesName = chart.current.plot(0).getSeries(i).name();
          if (seriesName === "Pivot High" || seriesName === "Pivot Low") {
            chart.current.plot(0).getSeries(i).enabled(false);
          }
        }
      }
    }
    if (stockTool.name === "Fibo Lines") {
      annotationIndex.FLineannotationIndex.forEach((elem) => {
        elem.enabled(false);
      });
    }
    if (stockTool.name === "52 Wk Hi Lo Range - Buy Sell") {
      var seriesLengthWkHi = chart.current
        .plot(stockDataStore.wkHiLoChartIndex)
        .getSeriesCount();
      for (let i = seriesLengthWkHi - 1 + 100; i > -1; i--) {
        if (chart.current.plot(stockDataStore.wkHiLoChartIndex).getSeries(i)) {
          let seriesNameWkHi = chart.current
            .plot(stockDataStore.wkHiLoChartIndex)
            .getSeries(i)
            .name();
          if (
            seriesNameWkHi === "on High" ||
            seriesNameWkHi === "on Low" ||
            seriesNameWkHi === "UB" ||
            seriesNameWkHi === "LB" ||
            seriesNameWkHi === "Mid" ||
            seriesNameWkHi === "bline" ||
            seriesNameWkHi === "sline"
          ) {
            chart.current
              .plot(stockDataStore.wkHiLoChartIndex)
              .getSeries(i)
              .enabled(false);
          }
        }
      }
    }
    if (stockTool.name === "William Vix Fix Top Bottom detection") {
      var seriesLengthVIXTopBottom = chart.current
        .plot(stockDataStore.VIXTopBottomChartIndex)
        .getSeriesCount();
      for (let i = seriesLengthVIXTopBottom - 1 + 100; i > -1; i--) {
        if (
          chart.current.plot(stockDataStore.VIXTopBottomChartIndex).getSeries(i)
        ) {
          let seriesNameVIXTopBottom = chart.current
            .plot(stockDataStore.VIXTopBottomChartIndex)
            .getSeries(i)
            .name();
          if (
            seriesNameVIXTopBottom === "wvf" ||
            seriesNameVIXTopBottom === "wvfr" ||
            seriesNameVIXTopBottom === "Historical Volatility"
          ) {
            chart.current
              .plot(stockDataStore.VIXTopBottomChartIndex)
              .getSeries(i)
              .enabled(false);
          }
        }
      }
    }
    if (stockTool.name === "Cyclical KO") {
      var seriesLengthKO = chart.current
        .plot(stockDataStore.kochartIndex)
        .getSeriesCount();
      for (let i = seriesLengthKO - 1 + 100; i > -1; i--) {
        if (chart.current.plot(stockDataStore.kochartIndex).getSeries(i)) {
          let seriesNameKO = chart.current
            .plot(stockDataStore.kochartIndex)
            .getSeries(i)
            .name();
          if (
            seriesNameKO === "KO1" ||
            seriesNameKO === "KO2" ||
            seriesNameKO === "KO3"
          ) {
            chart.current
              .plot(stockDataStore.kochartIndex)
              .getSeries(i)
              .enabled(false);
          }
        }
      }
    }
    if (stockTool.name === "Linear Regression Channel on Pivot") {
      var seriesLengthLinearRegression = chart.current.plot(0).getSeriesCount();
      for (let i = seriesLengthLinearRegression - 1 + 100; i > -1; i--) {
        if (chart.current.plot(0).getSeries(i)) {
          let seriesNameLinearRegression = chart.current
            .plot(0)
            .getSeries(i)
            .name();
          if (
            seriesNameLinearRegression === "Upper Channel Line" ||
            seriesNameLinearRegression === "Middle Channel Line" ||
            seriesNameLinearRegression === "Lower Channel Line" ||
            seriesNameLinearRegression === "Pivot High" ||
            seriesNameLinearRegression === "Pivot Low"
          ) {
            chart.current.plot(0).getSeries(i).enabled(false);
          }
        }
      }
    }
    if (stockTool.name === "Zig Zag + LR") {
      annotationIndex.ZigZagannotationIndex.forEach((elem) => {
        elem.enabled(false);
      });

      var zigZagSeriesLength = chart.current.plot(0).getSeriesCount();
      for (let i = zigZagSeriesLength - 1 + 100; i > -1; i--) {
        if (chart.current.plot(0).getSeries(i)) {
          let seriesName = chart.current.plot(0).getSeries(i).name();
          if (
            seriesName === "Upper Linear Regression Line" ||
            seriesName === "Median Linear Regression Line" ||
            seriesName === "Lower Linear Regression Line"
          ) {
            chart.current.plot(0).getSeries(i).enabled(false);
          }
        }
      }
    }
    if (stockTool.name === "ATR lines on lower timeframe") {
      annotationIndex.IntraATRannotationIndex.forEach((elem) => {
        elem.enabled(false);
      });

      var intraATRseriesLength = chart.current.plot(0).getSeriesCount();
      for (let i = intraATRseriesLength - 1 + 100; i > -1; i--) {
        if (chart.current.plot(0).getSeries(i)) {
          let seriesNameIntraATR = chart.current.plot(0).getSeries(i).name();
          if (
            seriesNameIntraATR === "ftop" ||
            seriesNameIntraATR === "fbot" ||
            seriesNameIntraATR === "fmid" ||
            seriesNameIntraATR === "f10" ||
            seriesNameIntraATR === "f20" ||
            seriesNameIntraATR === "f30" ||
            seriesNameIntraATR === "f40" ||
            seriesNameIntraATR === "f60" ||
            seriesNameIntraATR === "f70" ||
            seriesNameIntraATR === "f80" ||
            seriesNameIntraATR === "f90"
          ) {
            chart.current.plot(0).getSeries(i).enabled(false);
          }
        }
      }
    }
    if (stockTool.name === "10AM Hi Lo fibo") {
      annotationIndex.IntraFlineannotationIndex.forEach((elem) => {
        elem.enabled(false);
      });
    }
    dispatch(
      indicatorActions.toggleShowStockTool({
        index: toolIndex,
        hide: true,
      })
    );
  }, []);

  if (isFetching) return "Loading...";

  if (error) return "An error has occured:" + error.message;

  return (
    <Container fluid="md">
      <Row>
        <Col md={12} xl={12}>
          <ChartTopBar
            chart={chart}
            ticker={ticker}
            addIndicator={addIndicator}
            updateIndicator={updateIndicator}
            removeIndicator={removeIndicator}
            addStockTool={addStockTool}
            updateStockTool={updateStockTool}
            removeStockTool={removeStockTool}
            adjustDividend={adjustDividend}
            plotIndex={plotIndex}
            initialPicked={initialPicked}
            showIndicator={showIndicator}
            hideIndicator={hideIndicator}
            showStockTool={showStockTool}
            hideStockTool={hideStockTool}
          />
        </Col>
      </Row>
      <Row>
        <Col md={12} xl={12}>
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
            ticker={ticker}
            addIndicator={addIndicator}
            newStockData={stockData}
          />
          <IndicatorUpdate
            chart={chart}
            newStockData={stockData}
            plotIndex={plotIndex}
            interval={interval}
            adjustDividend={adjustDividend}
            ticker={ticker}
            initialPicked={initialPicked}
            addIndicator={addIndicator}
            addStockTool={addStockTool}
          />
          <div className="chartToolBarBottom">
            <ChartToolBar
              chart={chart}
              horizontal={true}
              toggleRealTime={toggleRealTime}
              changeTimeZone={changeTimeZone}
              timezone={timezone}
              stockData={stockData}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default TheChart;
