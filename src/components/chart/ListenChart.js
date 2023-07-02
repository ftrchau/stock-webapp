import { useEffect, useRef, forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import moment from "moment";
import anychart from "anychart";

import { drawingActions } from "../../store/drawing-slice";

import stockApi from "../../api/stock";

import indicatorApi from "../../api/indicator";

import drawingTool from "../toolbar/DRAWINGTOOL";
const indicatorCallback = async (api_func, params) => {
  return await indicatorApi[api_func](params);
};

const scrollLeftTimeUnit = (interval) => {
  let timeUnit = "";
  let intervalChar = interval.charAt(interval.length - 1);

  if (intervalChar === "m") {
    timeUnit = "hours";
  } else if (intervalChar === "h") {
    timeUnit = "days";
  } else if (
    intervalChar === "d" ||
    intervalChar === "k" ||
    intervalChar === "o"
  ) {
    timeUnit = "months";
  }

  return timeUnit;
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
    ];
  });
};

const getStockMax = (data, start, end) => {
  return Math.max(
    ...data.filter((p) => p[0] > start && p[0] < end).map((p) => p[2])
  );
};
const getStockMin = (data, start, end) => {
  return Math.min(
    ...data.filter((p) => p[0] > start && p[0] < end).map((p) => p[3])
  );
};

const intervalTimeUnitSingular = (interval) => {
  let timeUnit = "";
  let intervalChar = interval.charAt(interval.length - 1);
  if (intervalChar === "m") {
    timeUnit = "minute";
  } else if (intervalChar === "h") {
    timeUnit = "hour";
  } else if (intervalChar === "d") {
    timeUnit = "day";
  } else if (intervalChar === "k") {
    timeUnit = "week";
  } else if (intervalChar === "o") {
    timeUnit = "month";
  }

  return timeUnit;
};

function ListenChart(props) {
  const dispatch = useDispatch();

  const realStartTime = useRef(
    moment().subtract(21, "month").format("YYYY-MM-DD")
  );
  const realEndTime = useRef(moment().format("YYYY-MM-DD"));

  const currentIndicators = useSelector(
    (state) => state.indicator.currentIndicators
  );

  // const textAreaListen = useCallback((e, selectedAnnos, textArea) => {
  //   console.log("listening called");
  //   if (selectedAnnos) {
  //     if (selectedAnnos.type === "label" && textArea) {
  //       try {
  //         selectedAnnos.text(textArea.value.trim());
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  //   }
  // }, []);

  const {
    startDate,
    endDate,
    newStockData,
    interval,
    adjustDividend,
    realTime,
    chartTable,
    chartMapping,
    ticker,
  } = props;

  useEffect(() => {
    console.log("ListenChart render");
    var selectedAnno;
    var annotationLabel;

    if (props.chart.current) {
      var tempPrevStartDate;
      var newStartDate = startDate;
      var newEndDate = endDate;
      var tempStockData = newStockData;
      var oldStartDate = startDate;
      props.chart.current.listen(
        "selectedrangechangefinish",
        async function (e) {
          var max = getStockMax(tempStockData, e.firstVisible, e.lastSelected);
          var min = getStockMin(tempStockData, e.firstVisible, e.lastSelected);

          props.chart.current.plot(0).yScale().maximum(max.toFixed(2));
          props.chart.current.plot(0).yScale().minimum(min.toFixed(2));

          if (
            moment
              .unix(e.firstVisible / Math.pow(10, 3))
              .isBefore(moment(tempStockData[0][0])) ||
            moment
              .unix(e.firstVisible / Math.pow(10, 3))
              .isSame(
                moment(tempStockData[0][0]),
                intervalTimeUnitSingular(interval)
              )
          ) {
            tempPrevStartDate = moment.unix(e.firstVisible / Math.pow(10, 3));
            newStartDate = moment(newStartDate).subtract(
              48,
              scrollLeftTimeUnit(interval)
            );
            newEndDate = tempStockData[0][0];
            realStartTime.current = newStartDate;
            realEndTime.current = newEndDate;
            let apiResult = await stockApi.getStockPrice({
              ticker,
              startDate: newStartDate,
              endDate: newEndDate,
              interval,
              adjustDividend,
              realTime,
            });
            if (!apiResult) return;
            tempStockData = outputStockData(apiResult, adjustDividend);
            props.chart.current.grouping().enabled(false);
            console.log(tempStockData);
            chartTable.current.addData(tempStockData);
            chartMapping.current = chartTable.current.mapAs({
              open: 1,
              high: 2,
              low: 3,
              close: 4,
            });
            props.chart.current.selectRange(
              tempPrevStartDate
                .clone()
                .subtract(6, scrollLeftTimeUnit(interval))
                .valueOf(),
              tempPrevStartDate.valueOf()
            );
            max = getStockMax(
              tempStockData,
              tempPrevStartDate
                .clone()
                .subtract(6, scrollLeftTimeUnit(interval))
                .valueOf(),
              tempPrevStartDate.valueOf()
            );
            min = getStockMin(
              tempStockData,
              tempPrevStartDate
                .clone()
                .subtract(6, scrollLeftTimeUnit(interval))
                .valueOf(),
              tempPrevStartDate.valueOf()
            );

            props.chart.current.plot(0).yScale().maximum(max.toFixed(2));
            props.chart.current.plot(0).yScale().minimum(min.toFixed(2));
            console.log("this listen running?");
            console.log(currentIndicators);
            for await (let indicator of currentIndicators) {
              let apiInputParam = {};
              indicator.parameters.forEach((opt) => {
                apiInputParam[opt.name] = Number.isNaN(+opt.value)
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

              var addResultTemp = [];

              for (let p = 0; p < indicator.charts.length; p++) {
                var addResult = allResult.map((ar) => {
                  return [ar.date, +ar[indicator.charts[p].column]];
                });
                // if (Array.isArray(indicator.charts[p].stroke)) {
                //   addResultTemp = [...allResult, indicator.charts[p].result];
                // } else {
                //   addResultTemp = addResult;
                // }

                var table = anychart.data.table();
                table.addData(addResult);
                // table.addData(addResultTemp);
                var mapping = table.mapAs();
                mapping.addField("value", 1);
                var seriesLength = props.chart.current
                  .plot(indicator.charts[p].plotIndex)
                  .getSeriesCount();

                console.log(seriesLength);
                var conditions_temp = "";
                for (let i = seriesLength; i > -1; i--) {
                  conditions_temp = "";
                  if (
                    props.chart.current
                      .plot(indicator.charts[p].plotIndex)
                      .getSeries(i)
                  ) {
                    let seriesName = props.chart.current
                      .plot(indicator.charts[p].plotIndex)
                      .getSeries(i)
                      .name();
                    if (seriesName === indicator.charts[p].name) {
                      console.log(indicator.charts[p]);
                      console.log(i);
                      console.log(Array.isArray(indicator.charts[p].stroke));
                      if (Array.isArray(indicator.charts[p].stroke)) {
                        props.chart.current
                          .plot(indicator.charts[p].plotIndex)
                          .getSeries(i)
                          .data(mapping)
                          [
                            indicator.charts[p].seriesType === "column"
                              ? "fill"
                              : "stroke"
                            // eslint-disable-next-line no-loop-func
                          ](function () {
                            // console.log(addResultTemp);
                            if (!this.value) return this.sourceColor;
                            // console.log(this.x);
                            let resultIndex = addResultTemp.findIndex(
                              // (p) => p[0] === this.x
                              (p) => moment(p.date).valueOf() === this.x
                            );

                            if (!addResultTemp[resultIndex - 1]) return;
                            let prevValue =
                              addResultTemp[resultIndex - 1][
                                indicator.charts[p].column
                              ];

                            let strokeColor = "";
                            conditions_temp = "";

                            // console.log(this);

                            // return this.sourceColor;
                            for (
                              let k = 0;
                              k < indicator.charts[p].stroke.length;
                              k++
                            ) {
                              conditions_temp = "";
                              for (
                                let j = 0;
                                j <
                                indicator.charts[p].stroke[k].conditions.length;
                                j++
                              ) {
                                // conditions_temp = "";
                                if (
                                  typeof indicator.charts[p].stroke[k]
                                    .conditions[j] === "string"
                                ) {
                                  if (
                                    indicator.charts[p].stroke[k].conditions[
                                      j
                                    ] === "positive"
                                  ) {
                                    conditions_temp =
                                      conditions_temp === ""
                                        ? this.value >= 0
                                        : conditions_temp && this.value >= 0;
                                  }
                                  if (
                                    indicator.charts[p].stroke[k].conditions[
                                      j
                                    ] === "negative"
                                  ) {
                                    conditions_temp =
                                      conditions_temp === ""
                                        ? this.value < 0
                                        : conditions_temp && this.value < 0;
                                  }
                                  if (
                                    indicator.charts[p].stroke[k].conditions[
                                      j
                                    ] === "increase"
                                  ) {
                                    conditions_temp =
                                      conditions_temp === ""
                                        ? this.value > prevValue
                                        : conditions_temp &&
                                          this.value > prevValue;
                                  }
                                  if (
                                    indicator.charts[p].stroke[k].conditions[
                                      j
                                    ] === "decrease"
                                  ) {
                                    conditions_temp =
                                      conditions_temp === ""
                                        ? this.value < prevValue
                                        : conditions_temp &&
                                          this.value < prevValue;
                                  }
                                } else {
                                  conditions_temp =
                                    conditions_temp === ""
                                      ? indicator.charts[p].stroke[
                                          k
                                        ].conditions[j](
                                          this,
                                          resultIndex,
                                          addResultTemp
                                        )
                                      : indicator.charts[p].stroke[
                                          k
                                        ].conditions[j](
                                          this,
                                          resultIndex,
                                          addResultTemp
                                        );

                                  // console.log(conditions_temp);
                                }
                              }
                              if (conditions_temp) {
                                strokeColor =
                                  indicator.charts[p].stroke[k].color;
                                break;
                              }
                            }

                            if (conditions_temp) {
                              return strokeColor;
                            }

                            return this.sourceColor;
                          });
                      } else {
                        props.chart.current
                          .plot(indicator.charts[p].plotIndex)
                          .getSeries(i)
                          .data(mapping)
                          .stroke(indicator.charts[p].stroke);
                        // console.log(indicator.charts[p].name);
                        // console.log(i);
                        // console.log(indicator.charts[p]);
                        // console.log(i);
                      }
                    }
                  }
                }
              }

              var annotations =
                "annotations" in indicator
                  ? indicator.annotations.map((item) => ({
                      ...item,
                      annotationIndex: [...item.annotationIndex],
                    }))
                  : [];

              if (annotations.length > 0) {
                // eslint-disable-next-line no-loop-func
                indicator.annotations.forEach((anno, index) => {
                  let annoMappings = allResult
                    .filter(
                      (p) => p[anno.condition.column] === anno.condition.value
                    )
                    .map((p) => {
                      return {
                        xAnchor: moment(p.date).valueOf(),
                        valueAnchor: p[anno.parameters.valueAnchor],
                        text: p[anno.parameters.text],
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
                    annotations[index].annotationIndex.push(
                      props.chart.current
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

              props.chart.current.selectRange(
                moment(realEndTime.current)
                  .subtract(11, scrollLeftTimeUnit(interval))
                  .format("YYYY-MM-DD HH:mm:ss"),
                moment(realEndTime.current).format("YYYY-MM-DD HH:mm:ss")
              );
            }
          }
        }
      );

      props.chart.current.listen("annotationChangeFinish", function (e) {
        console.log("annotationChangeFinish");
        dispatch(drawingActions.toogleDrawToolBar(true));
      });
      props.chart.current.listen("annotationDrawingFinish", function (e) {
        if (e.annotation.type === "label") {
          annotationLabel.val = e.annotation.text();
          annotationLabel.focus();
        }
      });
      props.chart.current.listen("annotationUnselect", function (e) {
        console.log("annotationUnselect");
        dispatch(drawingActions.setDrawingToolSelected({}));
        dispatch(drawingActions.setMarkerTypeSelected({}));
        dispatch(drawingActions.toogleDrawToolBar(false));
        // textArea.removeEventListener("input", textAreaListen);
        // textArea.blur();
        if (annotationLabel) annotationLabel.value = "";
      });
      props.chart.current.listen("annotationSelect", function (e) {
        selectedAnno = e.annotation;
        var selectedDrawingTool;
        if (selectedAnno) {
          if (selectedAnno.type === "label") {
            if (annotationLabel) {
              annotationLabel.value = e.annotation.text();
              annotationLabel.focus();
              annotationLabel.addEventListener("input", function (e) {
                if (selectedAnno) selectedAnno.text(e.target.value.trim());
              });
            } else {
              var textArea = document.createElement("textarea");
              textArea.id = "annotation-label-test";
              document.body.appendChild(textArea);
              annotationLabel = document.getElementById(
                "annotation-label-test"
              );
              annotationLabel.focus();
              annotationLabel.addEventListener("input", function (e) {
                if (selectedAnno) selectedAnno.text(e.target.value.trim());
              });
            }
            selectedDrawingTool = { name: "label", annotationType: "label" };
          } else {
            selectedDrawingTool = drawingTool.find(
              (tool) => tool.annotationType === e.annotation.type
            );
          }

          dispatch(drawingActions.setDrawingToolSelected(selectedDrawingTool));
        }

        dispatch(drawingActions.toogleDrawToolBar(true));
      });
    }
  }, [
    props.chart,
    adjustDividend,
    chartMapping,
    chartTable,
    currentIndicators,
    endDate,
    interval,
    newStockData,
    realTime,
    startDate,
    ticker,
    dispatch,
  ]);

  return <div></div>;
}

export default ListenChart;
