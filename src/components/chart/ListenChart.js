import { useEffect, useRef, forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import moment from "moment";
import anychart from "anychart";

import { drawingActions } from "../../store/drawing-slice";

import stockApi from "../../api/stock";

import indicatorApi from "../../api/indicator";

import drawingTool from "../toolbar/DRAWINGTOOL";

import annotationIndex from "../chart/annotationIndex";
import { stockActions } from "../../store/stock-slice";

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
      p.volume,
    ];
  });
};

const getStockMax = (data, start, end) => {
  return Math.max(
    ...data
      .filter((p) => p[0] > start && p[0] < end && p[2] !== null)
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

const getPartialVolume = (y11, y12, y21, y22, height, vol) => {
  return height !== 0
    ? (Math.max(
        Math.min(Math.max(y11, y12), Math.max(y21, y22)) -
          Math.max(Math.min(y11, y12), Math.min(y21, y22)),
        0
      ) *
        vol) /
        height
    : 0;
};

const drawVolumeProfileFunction = async (
  stockTool,
  chart,
  ticker,
  interval,
  adjustDividend,
  realTime
) => {
  annotationIndex.VolumeProfileannotationIndex.forEach((elem) => {
    chart.plot(0).annotations().removeAnnotation(elem);
  });
  annotationIndex.VolumeProfileannotationIndex = [];

  let range = chart.getSelectedRange();
  let stockToolParameters = stockTool.parameters.find(
    (p) => p.name === "Row Size"
  );
  let cnum = +stockToolParameters.value; // row size
  let startPoint = stockTool.startPoint || range.firstSelected;
  let endPoint = stockTool.endPoint || range.lastSelected;

  let apiResult = await stockApi.getStockPrice({
    ticker,
    startDate: Math.ceil(startPoint / Math.pow(10, 3)),
    endDate: Math.ceil(endPoint / Math.pow(10, 3)),
    interval,
    adjustDividend,
    realTime,
  });

  ////console.log(apiResult);

  let stockData = outputStockData(apiResult, adjustDividend);

  let visibleStockData = stockData.filter((p) => {
    return startPoint <= p[0] && endPoint >= p[0];
  });

  ////console.log(visibleStockData);

  let bbars = stockTool.bbars || visibleStockData.length;
  let drawPOCLabel = stockTool.drawPOCLabel || false;

  ////console.log(startPoint);
  ////console.log(endPoint);

  var high = visibleStockData.map((p) => p[2]);
  var low = visibleStockData.map((p) => p[3]);
  var top = Math.max(...high);
  var bot = Math.min(...low);
  var dist = (top - bot) / 500;
  var step = (top - bot) / cnum;
  var levels = [];
  var volumes = [];
  var totalvols = [];
  for (let j = 0; j < cnum + 1; j++) {
    levels.push(bot + j * step);
    volumes.push(0);
    totalvols.push(0);
  }

  for (let j = cnum; j < 2 * cnum + 1; j++) {
    volumes.push(0);
  }

  ////console.log(bbars);

  for (let bars = 0; bars < bbars; bars++) {
    let body_top = Math.max(
      visibleStockData[bars][4],
      visibleStockData[bars][1]
    );
    let body_bot = Math.min(
      visibleStockData[bars][4],
      visibleStockData[bars][1]
    );
    let itsgreen = visibleStockData[bars][4] >= visibleStockData[bars][1];

    let topwick = visibleStockData[bars][2] - body_top;
    let bottomwick = body_bot - visibleStockData[bars][3];
    let body = body_top - body_bot;

    let bodyvol =
      (body * visibleStockData[bars][5]) /
      (2 * topwick + 2 * bottomwick + body);
    let topwickvol =
      (2 * topwick * visibleStockData[bars][5]) /
      (2 * topwick + 2 * bottomwick + body);
    let bottomwickvol =
      (2 * bottomwick * visibleStockData[bars][5]) /
      (2 * topwick + 2 * bottomwick + body);

    for (let j = 0; j < cnum; j++) {
      volumes[j] +=
        (itsgreen
          ? getPartialVolume(
              levels[j],
              levels[j + 1],
              body_bot,
              body_top,
              body,
              bodyvol
            )
          : 0) +
        getPartialVolume(
          levels[j],
          levels[j + 1],
          body_top,
          visibleStockData[bars][2],
          topwick,
          topwickvol
        ) /
          2 +
        getPartialVolume(
          levels[j],
          levels[j + 1],
          body_bot,
          visibleStockData[bars][3],
          bottomwick,
          bottomwickvol
        ) /
          2;

      volumes[j + cnum] +=
        (itsgreen
          ? 0
          : getPartialVolume(
              levels[j],
              levels[j + 1],
              body_bot,
              body_top,
              body,
              bodyvol
            )) +
        getPartialVolume(
          levels[j],
          levels[j + 1],
          body_top,
          visibleStockData[bars][2],
          topwick,
          topwickvol
        ) /
          2;
      //    +
      // getPartialVolume(
      //   levels[j],
      //   levels[j + 1],
      //   body_bot,
      //   visibleStockData[bars][3],
      //   bottomwick,
      //   bottomwickvol
      // ) /
      //   2;
    }
  }
  ////console.log(volumes);
  for (let j = 0; j < cnum; j++) {
    totalvols[j] = volumes[j] + volumes[j + cnum];
  }
  var poc = totalvols.indexOf(Math.max(...totalvols));
  var poc_level = (levels[poc] + levels[poc + 1]) / 2;
  var maxvol = Math.max(...totalvols);
  for (let j = 0; j < 2 * cnum; j++) {
    volumes[j] =
      (volumes[j] *
        (visibleStockData[visibleStockData.length - 1][0] -
          visibleStockData[0][0])) /
      (maxvol * 3);
  }
  var controller = chart.plot(0).annotations();

  for (let j = 0; j < cnum; j++) {
    if (
      !levels[j] ||
      !volumes[j] ||
      !levels[j + 1] ||
      !volumes[j + cnum] ||
      !startPoint
    )
      continue;
    annotationIndex.VolumeProfileannotationIndex.push(
      controller
        .rectangle({
          xAnchor: startPoint,
          valueAnchor: levels[j],
          secondXAnchor: startPoint + Math.round(volumes[j]),
          secondValueAnchor: levels[j + 1],
          normal: {
            fill: stockTool.positiveVolumeFill + " 0.3",
            stroke: stockTool.VolumeStroke,
          },
          hovered: {
            fill: stockTool.positiveVolumeFill + " 0.3",
            stroke: stockTool.VolumeStroke,
          },
          selected: {
            fill: stockTool.positiveVolumeFill + " 0.3",
            stroke: stockTool.VolumeStroke,
          },
        })
        .allowEdit(false)
    );
    // get the number of annotations
    // controller.getAnnotationsCount();
    // annotationIndex.push(controller.getAnnotationsCount() - 1);
    annotationIndex.VolumeProfileannotationIndex.push(
      controller
        .rectangle({
          xAnchor: startPoint + Math.round(volumes[j]),
          valueAnchor: levels[j],
          secondXAnchor:
            startPoint + Math.round(volumes[j]) + Math.round(volumes[j + cnum]),
          secondValueAnchor: levels[j + 1],
          normal: {
            fill: stockTool.negativeVolumeFill + " 0.2",
            stroke: stockTool.VolumeStroke,
          },
          hovered: {
            fill: stockTool.negativeVolumeFill + " 0.2",
            stroke: stockTool.VolumeStroke,
          },
          selected: {
            fill: stockTool.negativeVolumeFill + " 0.2",
            stroke: stockTool.VolumeStroke,
          },
        })
        .allowEdit(false)
    );
    // annotationIndex.push(controller.getAnnotationsCount() - 1);
  }
  annotationIndex.VolumeProfileannotationIndex.push(
    controller
      .line({
        xAnchor: startPoint,
        valueAnchor: poc_level,
        secondXAnchor: visibleStockData[visibleStockData.length - 1][0],
        secondValueAnchor: poc_level,
      })
      .allowEdit(false)
  );
  if (drawPOCLabel) {
    annotationIndex.VolumeProfileannotationIndex.push(
      controller
        .label({
          xAnchor: endPoint,
          valueAnchor: poc_level,
          text: poc_level.toFixed(2),
          normal: {
            fontColor: "rgb(255, 235, 59)",
          },
          hovered: {
            fontColor: "rgb(255, 235, 59)",
          },
          selected: {
            fontColor: "rgb(255, 235, 59)",
          },
        })
        .background({
          fill: "rgb(33, 150, 243)",
          stroke: "rgb(44, 152, 240)",
        })
        .allowEdit(false)
    );
  }
};

function ListenChart(props) {
  const dispatch = useDispatch();

  const currentStockTools = useSelector(
    (state) => state.indicator.currentStockTools
  );
  const indicators = useSelector((state) => state.indicator.indicators);

  // const newStockData = useSelector((state) => state.stock.stockData);

  const { interval, adjustDividend, ticker, plotIndex, newStockData } = props;

  const rangeStartDate = useSelector((state) => state.stock.rangeStartDate);

  const rangeEndDate = useSelector((state) => state.stock.rangeEndDate);
  const realTime = useSelector((state) => state.stock.realTime);

  useEffect(() => {
    //console.log("ListenChart render");
    var selectedAnno;
    var annotationLabel;

    if (props.chart.current) {
      var tempStockData = newStockData;
      var chartListenKey = props.chart.current.listen(
        "selectedrangechangefinish",
        async function (e) {
          //console.log(e.firstVisible);
          //console.log(e.lastSelected);
          dispatch(
            stockActions.setRangeDate({
              rangeStartDate: moment
                .unix(e.firstVisible / Math.pow(10, 3))
                .toDate(),
              rangeEndDate: moment
                .unix(e.lastSelected / Math.pow(10, 3))
                .toDate(),
            })
          );
          var max = getStockMax(tempStockData, e.firstVisible, e.lastSelected);
          var min = getStockMin(tempStockData, e.firstVisible, e.lastSelected);

          //console.log(max);
          //console.log(min);

          props.chart.current.plot(0).yScale().maximum(max.toFixed(2));
          props.chart.current.plot(0).yScale().minimum(min.toFixed(2));
          // for volume profile only
          for (let stockTool of currentStockTools) {
            ////console.log(stockTool);
            if (stockTool.name === "Volume Profile") {
              annotationIndex.VolumeProfileannotationIndex.forEach((elem) => {
                props.chart.current
                  .plot(0)
                  .annotations()
                  .removeAnnotation(elem);
              });
              annotationIndex.VolumeProfileannotationIndex = [];
              await drawVolumeProfileFunction(
                stockTool,
                props.chart.current,
                ticker,
                interval,
                adjustDividend,
                realTime
              );
            }
          }
        }
      );

      props.chart.current.listen("annotationChangeFinish", function (e) {
        ////console.log("annotationChangeFinish");
        dispatch(drawingActions.toogleDrawToolBar(true));
      });
      props.chart.current.listen("annotationDrawingFinish", function (e) {
        if (e.annotation.type === "label") {
          annotationLabel.val = e.annotation.text();
          annotationLabel.focus();
        }
      });
      props.chart.current.listen("annotationUnselect", function (e) {
        ////console.log("annotationUnselect");
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
              textArea.id = "annotation-label";
              document.body.appendChild(textArea);
              annotationLabel = document.getElementById(
                "annotation-label"
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

      props.chart.current.selectRange(rangeStartDate, rangeEndDate);
      const max = Math.max(
        ...newStockData
          .filter(
            (p) =>
              p[2] != null &&
              moment(p[0]) > moment(rangeStartDate) &&
              moment(p[0]) < moment(rangeEndDate)
          )
          .map((p) => p[2])
      );
      const min = Math.min(
        ...newStockData
          .filter(
            (p) =>
              p[3] != null &&
              moment(p[0]) > moment(rangeStartDate) &&
              moment(p[0]) < moment(rangeEndDate)
          )
          .map((p) => p[3])
      );

      // //console.log(max);
      // //console.log(min);

      props.chart.current.plot(0).yScale().maximum(max.toFixed(2));
      props.chart.current.plot(0).yScale().minimum(min.toFixed(2));

      var seriesLength = props.chart.current.plot(0).getSeriesCount();

      for (let s = seriesLength; s > -1; s--) {
        if (props.chart.current.plot(0).getSeries(s)) {
          ////console.log(props.chart.current.plot(0).getSeries(s));
        }
      }
    }

    return () => {
      if (chartListenKey && props.chart.current)
        props.chart.current.unlistenByKey(chartListenKey);
    };
  }, [
    props.chart,
    adjustDividend,
    interval,
    newStockData,
    realTime,
    ticker,
    dispatch,
    currentStockTools,
    plotIndex,
    rangeStartDate,
    rangeEndDate,
    indicators,
  ]);

  return <div></div>;
}

export default ListenChart;
