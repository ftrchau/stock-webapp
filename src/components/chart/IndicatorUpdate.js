import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import moment from "moment";
import anychart from "anychart";

import indicatorApi from "../../api/indicator";
import { indicatorActions } from "../../store/indicator-slice";

import annotationIndex from "../chart/annotationIndex";

import stockDataStore from "./stockDataStore";

const indicatorCallback = async (api_func, params) => {
  return await indicatorApi[api_func](params);
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

let indicatorUpdateInterval;

function IndicatorUpdate(props) {
  const dispatch = useDispatch();
  const startDate = useSelector((state) => state.stock.startDate);
  const endDate = useSelector((state) => state.stock.endDate);
  const realTime = useSelector((state) => state.stock.realTime);
  const tradingPeriod = useSelector((state) => state.stock.tradingPeriod);
  const rangeStartDate = useSelector((state) => state.stock.rangeStartDate);
  const rangeEndDate = useSelector((state) => state.stock.rangeEndDate);

  const currentIndicators = useSelector(
    (state) => state.indicator.currentIndicators
  );
  const indicators = useSelector((state) => state.indicator.indicators);
  const stockTools = useSelector((state) => state.indicator.stockTools);
  const currentStockTools = useSelector(
    (state) => state.indicator.currentStockTools
  );

  const needUpdate = useSelector((state) => state.indicator.needUpdate);
  const initialLoad = useSelector((state) => state.indicator.initialLoad);

  const {
    chart,
    plotIndex,
    interval,
    adjustDividend,
    ticker,
    initialPicked,
    addIndicator,
    addStockTool,
    newStockData,
  } = props;

  useEffect(() => {
    ////console.log("rerender IndicatorUpdate");
    if (chart.current) {
      const fetchCurrentIndicators = async () => {
        let cur = 0;
        for await (let indicator of currentIndicators) {
          if (indicator.type === "custom") {
            if (indicator.name === "Fibo Lines") {
              annotationIndex.FLineannotationIndex.forEach((elem) => {
                chart.current.plot(0).annotations().removeAnnotation(elem);
              });
              annotationIndex.FLineannotationIndex = [];

              await stockDataStore.addFbLine(
                chart.current,
                interval,
                newStockData,
                indicator,
                ticker,
                adjustDividend,
                startDate,
                endDate,
                true
              );
            }
            return;
          }
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
          var foundCharts = [];
          ////console.log(indicator.charts);
          for (let ch = 0; ch < indicator.charts.length; ch++) {
            ////console.log(indicator.charts[ch]);
            var seriesLength = chart.current
              .plot(indicator.charts[ch].plotIndex)
              .getSeriesCount();

            for (let s = seriesLength; s > -1; s--) {
              if (
                chart.current.plot(indicator.charts[ch].plotIndex).getSeries(s)
              ) {
                let seriesName = chart.current
                  .plot(indicator.charts[ch].plotIndex)
                  .getSeries(s)
                  .name();
                if (seriesName === indicator.charts[ch].name) {
                  foundCharts.push(seriesName);
                  break;
                }
              }
            }
          }

          // if (foundCharts.length > 0) continue;

          let apiInput = {
            ...apiInputParam,
            ticker,
            interval,
            adjustDividend,
            startDate: startDate,
            endDate: endDate,
            realTime,
          };

          // if (!realTime) {
          //   apiInput.endDate = endDate;
          // } else {
          //   apiInput.startDate =
          //     moment(tradingPeriod.regularStart, moment.ISO_8601).valueOf() /
          //     Math.pow(10, 3);
          // }

          let allResult = await indicatorCallback(indicator.apiFunc, apiInput);

          if (!allResult) continue;

          console.log(indicator.charts);

          for (let p = 0; p < indicator.charts.length; p++) {
            let addResult;
            let addResultColumns;
            var findChart = false;
            seriesLength = chart.current
              .plot(indicator.charts[p].plotIndex)
              .getSeriesCount();

            var foundSeries;
            for (let s = seriesLength; s > -1; s--) {
              if (
                chart.current.plot(indicator.charts[p].plotIndex).getSeries(s)
              ) {
                let seriesName = chart.current
                  .plot(indicator.charts[p].plotIndex)
                  .getSeries(s)
                  .name();
                if (seriesName === indicator.charts[p].name) {
                  findChart = true;
                  foundSeries = s;
                  break;
                }
              }
            }

            if ("condition" in indicator.charts[p]) {
              if (Array.isArray(indicator.charts[p].condition)) {
                if (
                  !indicator.charts[p].condition.reduce(
                    (accumulator, currentCond) =>
                      accumulator &&
                      apiInputParam[currentCond.parameter] ===
                        currentCond.value,
                    true
                  )
                ) {
                  continue;
                }
              } else {
                if (
                  apiInputParam[indicator.charts[p].condition.parameter] !==
                  indicator.charts[p].condition.value
                )
                  continue;
              }
            }

            if ("range" in indicator.charts[p]) {
              ////console.log(allResult);
              addResultColumns = allResult.filter(
                (value, index) =>
                  index >=
                    allResult.length -
                      1 -
                      indicator.charts[p].range.startOffset &&
                  index <=
                    allResult.length - 1 - indicator.charts[p].range.endOffset
              );
              addResult = addResultColumns.map((r, index) => {
                return [
                  moment(r.date).valueOf(),
                  +r[indicator.charts[p].column],
                ];
              });
            } else {
              addResultColumns = allResult.filter(
                (r) => r[indicator.charts[p].column]
              );
              addResult = addResultColumns.map((r, index) => {
                return [
                  moment(r.date).valueOf(),
                  +r[indicator.charts[p].column],
                ];
              });
            }
            var table = anychart.data.table();
            table.addData(addResult);
            var mapping = table.mapAs();
            mapping.addField("value", 1);

            var chartTemp;
            if (Array.isArray(indicator.charts[p].stroke)) {
              charts[p].result = allResult;

              console.log(findChart);

              if (findChart) {
                chart.current
                  .plot(indicator.charts[p].plotIndex)
                  .getSeries(foundSeries)
                  .data(mapping);
              } else {
                chartTemp = chart.current
                  .plot(indicator.charts[p].plotIndex)
                  [indicator.charts[p].seriesType](mapping)
                  [
                    indicator.charts[p].seriesType === "column"
                      ? "fill"
                      : "stroke"
                  ](function () {
                    if (!this.value) return this.sourceColor;
                    if (!this.x) return this.sourceColor;
                    // ////console.log(this.x);
                    let resultIndex = addResult.findIndex(
                      // (p) => p[0] === moment(this.x).valueOf()
                      (p) => p[1] === this.value
                    );
                    let prevValue = !addResult[resultIndex - 1]
                      ? null
                      : addResult[resultIndex - 1][1];

                    let strokeColor = "";
                    let conditions_temp = "";
                    // ////console.log("is this still affecting??");

                    for (
                      let i = 0;
                      i < indicator.charts[p].stroke.length;
                      i++
                    ) {
                      conditions_temp = "";
                      for (
                        let j = 0;
                        j < indicator.charts[p].stroke[i].conditions.length;
                        j++
                      ) {
                        // conditions_temp = "";
                        if (
                          typeof indicator.charts[p].stroke[i].conditions[j] ===
                          "string"
                        ) {
                          if (
                            indicator.charts[p].stroke[i].conditions[j] ===
                            "positive"
                          ) {
                            conditions_temp =
                              conditions_temp === ""
                                ? this.value >= 0
                                : conditions_temp && this.value >= 0;
                          }
                          if (
                            indicator.charts[p].stroke[i].conditions[j] ===
                            "negative"
                          ) {
                            conditions_temp =
                              conditions_temp === ""
                                ? this.value < 0
                                : conditions_temp && this.value < 0;
                          }
                          if (
                            indicator.charts[p].stroke[i].conditions[j] ===
                            "increase"
                          ) {
                            conditions_temp =
                              conditions_temp === ""
                                ? this.value > prevValue
                                : conditions_temp && this.value > prevValue;
                          }
                          if (
                            indicator.charts[p].stroke[i].conditions[j] ===
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
                              ? indicator.charts[p].stroke[i].conditions[j](
                                  this,
                                  resultIndex,
                                  addResultColumns
                                )
                              : indicator.charts[p].stroke[i].conditions[j](
                                  this,
                                  resultIndex,
                                  addResultColumns
                                );
                        }
                      }
                      if (conditions_temp) {
                        // console.log(indicator.charts[p].stroke[i]);
                        strokeColor = indicator.charts[p].stroke[i].color;
                        break;
                      }
                    }

                    if (conditions_temp) {
                      return strokeColor;
                    } else {
                      if ("defaultStroke" in indicator.charts[p]) {
                        return indicator.charts[p].defaultStroke;
                      }
                    }

                    return this.sourceColor;
                  })
                  .name(indicator.charts[p].name);
              }
            } else {
              chartTemp = chart.current
                .plot(indicator.charts[p].plotIndex)
                [indicator.charts[p].seriesType](mapping)
                ["name"](indicator.charts[p].name)
                [
                  indicator.charts[p].seriesType === "column"
                    ? "fill"
                    : "stroke"
                ](...indicator.charts[p].stroke.split(";"));
            }
            if (indicator.charts[p].seriesType === "marker") {
              chartTemp.size(indicator.charts[p].size);
            }
            if ("markerType" in indicator.charts[p]) {
              chartTemp.type(indicator.charts[p].markerType);
            }

            if ("fill" in indicator.charts[p]) {
              chartTemp.fill(indicator.charts[p].fill);
            }

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
          }

          if (annotations.length > 0) {
            for (let index = 0; index < indicator.annotations.length; index++) {
              let anno = indicator.annotations[index];
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
                    secondXAnchor: moment(
                      allResultFilter[idx + 1].date
                    ).valueOf(),
                    secondValueAnchor:
                      allResultFilter[idx + 1][
                        anno.parameters.secondValueAnchor
                      ],
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

              for (let s = 0; s < annoMappings.length; s++) {
                let annoMapping = annoMappings[s];
                let annoTemp = chart.current
                  .plot(anno.plotIndex)
                  .annotations()
                  [anno.type](annoMapping);

                if (anno.type !== "line") {
                  annoTemp.background({
                    fill: anno.background.fill,
                    stroke: anno.background.stroke,
                  });
                }

                annotations[index].annotationIndex.push(
                  annoTemp.allowEdit(false)
                  // .background({
                  //   fill: anno.background.fill,
                  //   stroke: anno.background.stroke,
                  // })
                );
              }
            }

            if ("yscale" in indicator) {
              for (let i = 0; i < indicator.yscale.length; i++) {
                let yscale_value;
                if (typeof indicator.yscale[i].value === "object") {
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

                  for (
                    let s = 0;
                    s < indicator.yscale[i].value.parameters.length;
                    s++
                  ) {
                    // column_values.concat(
                    // visibleAllResult
                    //   .filter((p) => p[indicator.yscale.value.parameters[s]])
                    //   .map((p) => p[indicator.yscale.value.parameters[s]])
                    // );
                    column_values.push(
                      indicator.yscale[i].type === "minimum"
                        ? Math.min(
                            ...visibleAllResult
                              .filter(
                                (p) =>
                                  p[indicator.yscale[i].value.parameters[s]]
                              )
                              .map(
                                (p) =>
                                  p[indicator.yscale[i].value.parameters[s]]
                              )
                          )
                        : Math.max(
                            ...visibleAllResult
                              .filter(
                                (p) =>
                                  p[indicator.yscale[i].value.parameters[s]]
                              )
                              .map(
                                (p) =>
                                  p[indicator.yscale[i].value.parameters[s]]
                              )
                          )
                    );
                  }

                  yscale_value =
                    indicator.yscale[i].type === "minimum"
                      ? Math.min(...column_values) * 0.98
                      : Math.max(...column_values) * 1.02;
                } else {
                  yscale_value = indicator.yscale[i].value;
                }

                chart.current
                  .plot(plotIndex.current)
                  .yScale()
                  [indicator.yscale[i].type](yscale_value);
              }
            }

            ////console.log(cur);

            dispatch(
              indicatorActions.setIndicatorAnnotationIndex({
                indicatorIndex: cur,
                annotations,
              })
            );
          }
          cur++;
        }
      };
      const fetchCurrentStockTools = async () => {
        var seriesChart = [];
        for await (let stockTool of currentStockTools) {
          seriesChart = [];
          if (stockTool.name === "Pivot Hi Lo") {
            seriesChart = ["Pivot High", "Pivot Low"];
          }
          if (stockTool.name === "52 Wk Hi Lo Range - Buy Sell") {
            seriesChart = [
              "on High",
              "on Low",
              "UB",
              "LB",
              "Mid",
              "bline",
              "sline",
            ];
          }
          if (stockTool.name === "MR Bottom Detector") {
            seriesChart = ["f1", "f2", "f3", "f4", "f5", "f6"];
          }
          if (stockTool.name === "William Vix Fix Top Bottom detection") {
            seriesChart = ["wvf", "wvfr", "Historical Volatility"];
          }
          if (stockTool.name === "Linear Regression Channel on Pivot") {
            seriesChart = [
              "Upper Channel Line",
              "Middle Channel Line",
              "Lower Channel Line",
              "Pivot High",
              "Pivot Low",
            ];
          }
          if (stockTool.name === "Zig Zag + LR") {
            seriesChart = [
              "Upper Linear Regression Line",
              "Median Linear Regression Line",
              "Lower Linear Regression Line",
            ];
          }
          var foundCharts = [];

          var seriesLength = chart.current
            .plot(stockTool.plotIndex)
            .getSeriesCount();

          for (let s = seriesLength; s > -1; s--) {
            if (chart.current.plot(stockTool.plotIndex).getSeries(s)) {
              let seriesName = chart.current
                .plot(stockTool.plotIndex)
                .getSeries(s)
                .name();
              if (seriesChart.includes(seriesName)) {
                foundCharts.push(seriesName);
                break;
              }
            }
          }

          if (foundCharts.length > 0) continue;

          if (stockTool.name === "Volume Profile") {
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
              newStockData,
              stockTool,
              ticker,
              adjustDividend,
              startDate,
              endDate,
              false
            );
          }

          if (stockTool.name === "Fibo Lines") {
            await stockDataStore.addFbLine(
              chart,
              interval,
              newStockData,
              stockTool,
              ticker,
              adjustDividend,
              startDate,
              endDate,
              false
            );
          }

          if (stockTool.name === "52 Wk Hi Lo Range - Buy Sell") {
            await stockDataStore.addWkHiLo(
              chart,
              interval,
              newStockData,
              stockTool,
              ticker,
              adjustDividend,
              startDate,
              endDate,
              stockTool.plotIndex,
              false
            );
          }
          if (stockTool.name === "MR Bottom Detector") {
            await stockDataStore.addMRButton(
              chart,
              interval,
              stockTool,
              ticker,
              adjustDividend,
              startDate,
              endDate,
              false
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
              false
            );
          }
          if (stockTool.name === "Cyclical KO") {
            await stockDataStore.addKO(
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
          if (stockTool.name === "Linear Regression Channel on Pivot") {
            await stockDataStore.addLinearRegression(
              chart,
              interval,
              stockTool,
              ticker,
              adjustDividend,
              startDate,
              endDate,
              false
            );
          }
          if (stockTool.name === "Zig Zag + LR") {
            await stockDataStore.addZigZag(
              chart,
              interval,
              stockTool,
              ticker,
              adjustDividend,
              startDate,
              endDate,
              false
            );
          }
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
        }
      };

      //   chart.current.plot(0).removeAllSeries();
      if (needUpdate) {
        fetchCurrentIndicators();
        fetchCurrentStockTools();
        ////console.log(rangeStartDate);
        ////console.log(rangeEndDate);
        chart.current.selectRange(rangeStartDate, rangeEndDate);

        dispatch(indicatorActions.setNeedUpdate(false));
      }

      if (initialLoad) {
        const addIndicatorCallback = async () => {
          for await (let ind of initialPicked.indicators) {
            await addIndicator(
              [
                ...indicators["Traditional Indicator"],
                ...indicators["Innovative Indicators"],
              ].find((selind) => selind.name === ind)
            );
          }
        };

        const addStockToolCallback = async () => {
          for await (let stocktool of initialPicked.stockTools) {
            await addStockTool(stockTools.find((st) => st.name === stocktool));
          }
        };

        // for (let stockTool of initialPicked.stockTools) {
        //   dispatch(indicatorActions.addStockTools(stockTool));
        // }

        // addIndicatorCallback();
        // addStockToolCallback();
        dispatch(indicatorActions.setInitialLoad(false));
      }

      if (realTime) {
        indicatorUpdateInterval = setInterval(() => {
          if (
            moment(tradingPeriod.regularStart, moment.ISO_8601).isBefore(
              moment()
            ) &&
            moment(tradingPeriod.regularEnd, moment.ISO_8601).isAfter(moment())
          ) {
            fetchCurrentIndicators();
            fetchCurrentStockTools();
          }
        }, 60000);
      }
    }
  }, [
    chart,
    currentIndicators,
    currentStockTools,
    dispatch,
    ticker,
    interval,
    adjustDividend,
    startDate,
    endDate,
    realTime,
    plotIndex,
    newStockData,
    needUpdate,
    initialLoad,
    addIndicator,
    indicators,
    initialPicked,
    addStockTool,
    stockTools,
  ]);

  return <div></div>;
}

export default IndicatorUpdate;
