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
import stockDataStore from "./stockDataStore";

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
              await stockDataStore.drawVolumeProfileFunction(
                stockTool,
                props.chart,
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
              annotationLabel = document.getElementById("annotation-label");
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
