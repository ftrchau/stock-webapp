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

import "./TheChart.css";

const getStockMax = (data, start, end) => {
  console.log(data);
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
    chart.current.plot(0).annotations().removeAnnotation(elem);
  });
  annotationIndex.VolumeProfileannotationIndex = [];

  let range = chart.current.getSelectedRange();
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

  console.log(apiResult);

  let stockData = outputStockData(apiResult, adjustDividend);

  let visibleStockData = stockData.filter((p) => {
    return startPoint <= p[0] && endPoint >= p[0];
  });

  let bbars = stockTool.bbars || visibleStockData.length;
  let drawPOCLabel = stockTool.drawPOCLabel || false;

  console.log(startPoint);
  console.log(endPoint);

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
    console.log(visibleStockData);

    let bodyvol =
      (body * visibleStockData[bars][5]) /
      (2 * topwick + 2 * bottomwick + body);
    let topwickvol =
      (2 * topwick * visibleStockData[bars][5]) /
      (2 * topwick + 2 * bottomwick + body);
    let bottomwickvol =
      (2 * bottomwick * visibleStockData[bars][5]) /
      (2 * topwick + 2 * bottomwick + body);
    console.log(body_bot);
    console.log(body_top);
    console.log(body);
    console.log(bodyvol);

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
  var controller = chart.current.plot(0).annotations();

  console.log(cnum);
  console.log(startPoint);
  console.log(levels);
  console.log(volumes);

  for (let j = 0; j < cnum; j++) {
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
  annotationIndex.FLineannotationIndex.push(line);
  var label = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base,
    text: "0 ( " + base.toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label.background(false);
  label.allowEdit(false);
  annotationIndex.FLineannotationIndex.push(label);

  var line236 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 0.236 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 0.236 * dd * ud,
    normal: { stroke: "1 #787B86" },
  });
  annotationIndex.FLineannotationIndex.push(line236);

  var label236 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 0.236 * dd * ud,
    text: "0.236 ( " + (base + 0.236 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label236.background(false);
  label236.allowEdit(false);
  annotationIndex.FLineannotationIndex.push(label236);
  // label236.anchor("center-top");
  // label236.padding(0, 0, 0, 0);

  var line382 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 0.382 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 0.382 * dd * ud,
    normal: { stroke: "1 #808000" },
  });
  annotationIndex.FLineannotationIndex.push(line382);

  var label382 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 0.382 * dd * ud,
    text: "0.382 ( " + (base + 0.382 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label382.background(false);
  label382.allowEdit(false);
  annotationIndex.FLineannotationIndex.push(label382);

  var line500 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 0.5 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 0.5 * dd * ud,
    normal: { stroke: "1 #E040FB" },
  });
  annotationIndex.FLineannotationIndex.push(line500);

  var label500 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 0.5 * dd * ud,
    text: "0.5 ( " + (base + 0.5 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label500.background(false);
  label500.allowEdit(false);
  annotationIndex.FLineannotationIndex.push(label500);

  var line618 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 0.618 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 0.618 * dd * ud,
    normal: { stroke: "1 #808000" },
  });
  annotationIndex.FLineannotationIndex.push(line618);
  var label618 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 0.618 * dd * ud,
    text: "0.618 ( " + (base + 0.618 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label618.background(false);
  label618.allowEdit(false);
  annotationIndex.FLineannotationIndex.push(label618);
  var line786 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 0.786 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 0.786 * dd * ud,
    normal: { stroke: "1 #787B86" },
  });
  annotationIndex.FLineannotationIndex.push(line786);
  var label786 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 0.786 * dd * ud,
    text: "0.786 ( " + (base + 0.786 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label786.background(false);
  label786.allowEdit(false);
  annotationIndex.FLineannotationIndex.push(label786);
  var line100 = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base + 1 * dd * ud,
    secondXAnchor: lastPoint,
    secondValueAnchor: base + 1 * dd * ud,
    normal: { stroke: "1 #FF9800" },
  });
  annotationIndex.FLineannotationIndex.push(line100);
  var label100 = controller.label({
    xAnchor: moment(firstPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
    valueAnchor: base + 1.0 * dd * ud,
    text: "1.0 ( " + (base + 1.0 * dd * ud).toFixed(2) + " ) ",
    normal: { fontColor: "rgb(41, 98, 255)" },
  });
  label100.background(false);
  label100.allowEdit(false);
  annotationIndex.FLineannotationIndex.push(label100);
  if (showH) {
    var labH = controller.label({
      xAnchor: lastPvl[0],
      valueAnchor: base + 1.0 * dd * ud,
      text: "Hi",
      normal: { fontColor: "rgb(255, 82, 82)" },
    });
    labH.background(false);
    labH.allowEdit(false);
    annotationIndex.FLineannotationIndex.push(labH);
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
    annotationIndex.FLineannotationIndex.push(labL);
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

  annotationIndex.FLineannotationIndex.push(line);
  annotationIndex.FLineannotationIndex.push(label);
  annotationIndex.FLineannotationIndex.push(line236);
  annotationIndex.FLineannotationIndex.push(label236);
  annotationIndex.FLineannotationIndex.push(line382);
  annotationIndex.FLineannotationIndex.push(label382);
  annotationIndex.FLineannotationIndex.push(line500);
  annotationIndex.FLineannotationIndex.push(label500);
  annotationIndex.FLineannotationIndex.push(line618);
  annotationIndex.FLineannotationIndex.push(label618);
  annotationIndex.FLineannotationIndex.push(line786);
  annotationIndex.FLineannotationIndex.push(label786);
  annotationIndex.FLineannotationIndex.push(line100);
  annotationIndex.FLineannotationIndex.push(label100);
};

const addFline = async function (
  chart,
  interval,
  stockData,
  stockTool,
  ticker,
  adjustDividend,
  realStartTime,
  realEndTime,
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
    startDate: realStartTime,
    endDate: realEndTime,
  });
  if (PivotHiLoresult) {
    console.log(PivotHiLoresult);
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

    console.log(PivotHiLopvhData);
    console.log(PivotHiLopvlData);
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

var wkHiLoChartIndex;

const addWkHiLo = async function (
  chart,
  interval,
  stockData,
  stockTool,
  ticker,
  adjustDividend,
  realStartTime,
  realEndTime,
  plotIndex,
  update = false
) {
  let apiInputParam = {};
  stockTool.parameters.forEach((opt) => {
    apiInputParam[opt.name] =
      Number.isNaN(+opt.value) || typeof opt.value == "boolean"
        ? opt.value
        : +opt.value;
  });
  const WkHiLoRangeresult = await indicatorApi.calculateWkHiLoRange({
    ...apiInputParam,
    ticker,
    interval,
    adjustDividend,
    startDate: realStartTime,
    endDate: realEndTime,
  });
  console.log(WkHiLoRangeresult);
  if (WkHiLoRangeresult) {
    let WkHiLoRangeHHpctData = WkHiLoRangeresult.map((p) => {
      return [moment(p.date).valueOf(), p.HHpct];
    });
    let WkHiLoRangeLLpctData = WkHiLoRangeresult.map((p) => {
      return [moment(p.date).valueOf(), p.LLpct];
    });
    let WkHiLoRangeblineData = WkHiLoRangeresult.map((p) => {
      return [moment(p.date).valueOf(), p.bline];
    });
    let WkHiLoRangeslineData = WkHiLoRangeresult.map((p) => {
      return [moment(p.date).valueOf(), p.sline];
    });

    var UBLineData = WkHiLoRangeresult.map((p) => {
      return [
        moment(p.date).valueOf(),
        +stockTool.parameters.find((p) => p.name === "UB").value,
      ];
    });

    var LBLineData = WkHiLoRangeresult.map((p) => {
      return [
        moment(p.date).valueOf(),
        +stockTool.parameters.find((s) => s.name === "LB").value,
      ];
    });
    var MidLineData = WkHiLoRangeresult.map((p) => {
      return [moment(p.date).valueOf(), 50];
    });

    var WkHiLoRangeHHpctTable = anychart.data.table();
    WkHiLoRangeHHpctTable.addData(WkHiLoRangeHHpctData);
    var WkHiLoRangeHHpctMapping = WkHiLoRangeHHpctTable.mapAs();
    WkHiLoRangeHHpctMapping.addField("value", 1);

    var WkHiLoRangeLLpctTable = anychart.data.table();
    WkHiLoRangeLLpctTable.addData(WkHiLoRangeLLpctData);
    var WkHiLoRangeLLpctMapping = WkHiLoRangeLLpctTable.mapAs();
    WkHiLoRangeLLpctMapping.addField("value", 1);

    var WkHiLoRangeblineTable = anychart.data.table();
    WkHiLoRangeblineTable.addData(WkHiLoRangeblineData);
    var WkHiLoRangeblineMapping = WkHiLoRangeblineTable.mapAs();
    WkHiLoRangeblineMapping.addField("value", 1);

    var WkHiLoRangeslineTable = anychart.data.table();
    WkHiLoRangeslineTable.addData(WkHiLoRangeslineData);
    var WkHiLoRangeslineMapping = WkHiLoRangeslineTable.mapAs();
    WkHiLoRangeslineMapping.addField("value", 1);

    var UBLineTable = anychart.data.table();
    UBLineTable.addData(UBLineData);
    var UBLineMapping = UBLineTable.mapAs();
    UBLineMapping.addField("value", 1);

    var LBLineTable = anychart.data.table();
    LBLineTable.addData(LBLineData);
    var LBLineMapping = LBLineTable.mapAs();
    LBLineMapping.addField("value", 1);

    var MidLineTable = anychart.data.table();
    MidLineTable.addData(MidLineData);
    var MidLineMapping = MidLineTable.mapAs();
    MidLineMapping.addField("value", 1);
    if (!update) {
      chart.current
        .plot(plotIndex.current + 1)
        .line(WkHiLoRangeHHpctMapping)
        .stroke("rgb(0, 188, 212)")
        .name("on High");
      chart.current
        .plot(plotIndex.current + 1)
        .line(WkHiLoRangeLLpctMapping)
        .stroke("rgb(255, 152, 0)")
        .name("on Low");
      chart.current
        .plot(plotIndex.current + 1)
        .line(UBLineMapping)
        .stroke("rgb(255, 82, 82)")
        .name("UB");
      chart.current
        .plot(plotIndex.current + 1)
        .line(LBLineMapping)
        .stroke("rgb(255, 82, 82)")
        .name("LB");
      chart.current
        .plot(plotIndex.current + 1)
        .line(MidLineMapping)
        .stroke("rgb(255, 82, 82)")
        .name("Mid");
      chart.current
        .plot(plotIndex.current + 1)
        .line(WkHiLoRangeblineMapping)
        .stroke("#800020")
        .name("bline");
      chart.current
        .plot(plotIndex.current + 1)
        .line(WkHiLoRangeslineMapping)
        .stroke("#087830")
        .name("sline");
      wkHiLoChartIndex = plotIndex.current + 1;
      plotIndex.current += 1;
    } else {
      let seriesNames = [
        "on High",
        "on Low",
        "UB",
        "LB",
        "Mid",
        "bline",
        "sline",
      ];
      let seriesMapping = {
        "on High": WkHiLoRangeHHpctMapping,
        "on Low": WkHiLoRangeLLpctMapping,
        UB: UBLineMapping,
        LB: LBLineMapping,
        Mid: MidLineMapping,
        bline: WkHiLoRangeblineMapping,
        sline: WkHiLoRangeslineMapping,
      };
      let seriesLength = chart.current.plot(wkHiLoChartIndex).getSeriesCount();

      for (let i = seriesLength - 1 + 100; i > -1; i--) {
        if (chart.current.plot(wkHiLoChartIndex).getSeries(i)) {
          let seriesName = chart.current
            .plot(wkHiLoChartIndex)
            .getSeries(i)
            .name();
          if (seriesNames.includes(seriesName)) {
            console.log(seriesName);
            chart.current
              .plot(wkHiLoChartIndex)
              .getSeries(i)
              .data(seriesMapping[seriesName]);
          }
        }
      }
    }
  }
};

const addMRButton = async function (
  chart,
  interval,
  stockData,
  stockTool,
  ticker,
  adjustDividend,
  realStartTime,
  realEndTime,
  update = false
) {
  let apiInputParam = {};
  stockTool.parameters.forEach((opt) => {
    apiInputParam[opt.name] =
      Number.isNaN(+opt.value) || typeof opt.value == "boolean"
        ? opt.value
        : +opt.value;
  });
  const MRBottomresult = await indicatorApi.calculateMRBottom({
    ...apiInputParam,
    ticker,
    interval,
    adjustDividend,
    startDate: realStartTime,
    endDate: realEndTime,
  });

  if (MRBottomresult) {
    let MRBottomf1Data = MRBottomresult.filter((p) => p.f1).map((p, idx) => {
      return [moment(p.date).valueOf(), p.low];
    });

    let MRBottomf2Data = MRBottomresult.filter((p) => p.f2).map((p, idx) => {
      return [moment(p.date).valueOf(), p.low];
    });

    let MRBottomf3Data = MRBottomresult.filter((p) => p.f3).map((p, idx) => {
      return [moment(p.date).valueOf(), p.low];
    });

    let MRBottomf4Data = MRBottomresult.filter((p) => p.f4).map((p, idx) => {
      return [moment(p.date).valueOf(), p.low];
    });

    let MRBottomf5Data = MRBottomresult.filter((p) => p.f5).map((p, idx) => {
      return [moment(p.date).valueOf(), p.low];
    });

    let MRBottomf6Data = MRBottomresult.filter((p) => p.f6).map((p, idx) => {
      return [moment(p.date).valueOf(), p.low];
    });

    var MRBottomf1Table = anychart.data.table();

    MRBottomf1Table.addData(MRBottomf1Data);
    var MRBottomf1Mapping = MRBottomf1Table.mapAs();
    MRBottomf1Mapping.addField("value", 1);

    var MRBottomf2Table = anychart.data.table();
    MRBottomf2Table.addData(MRBottomf2Data);
    var MRBottomf2Mapping = MRBottomf2Table.mapAs();
    MRBottomf2Mapping.addField("value", 1);

    var MRBottomf3Table = anychart.data.table();
    MRBottomf3Table.addData(MRBottomf3Data);
    var MRBottomf3Mapping = MRBottomf3Table.mapAs();
    MRBottomf3Mapping.addField("value", 1);

    var MRBottomf4Table = anychart.data.table();
    MRBottomf4Table.addData(MRBottomf4Data);
    var MRBottomf4Mapping = MRBottomf4Table.mapAs();
    MRBottomf4Mapping.addField("value", 1);

    var MRBottomf5Table = anychart.data.table();
    MRBottomf5Table.addData(MRBottomf5Data);
    var MRBottomf5Mapping = MRBottomf5Table.mapAs();
    MRBottomf5Mapping.addField("value", 1);

    var MRBottomf6Table = anychart.data.table();
    MRBottomf6Table.addData(MRBottomf6Data);
    var MRBottomf6Mapping = MRBottomf6Table.mapAs();
    MRBottomf6Mapping.addField("value", 1);

    if (!update) {
      chart.current
        .plot(0)
        .marker(MRBottomf1Mapping)
        .type("cross")
        .fill("rgb(238, 238, 171)")
        .stroke("rgb(238, 238, 171)")
        .name("f1");

      chart.current
        .plot(0)
        .marker(MRBottomf2Mapping)
        .type("cross")
        .fill("rgb(241, 226, 9)")
        .stroke("rgb(241, 226, 9)")
        .name("f2");

      chart.current
        .plot(0)
        .marker(MRBottomf3Mapping)
        .type("cross")
        .fill("rgb(250, 177, 19)")
        .stroke("rgb(250, 177, 19)")
        .name("f3");

      chart.current
        .plot(0)
        .marker(MRBottomf4Mapping)
        .type("diagonal-cross")
        .fill("rgb(240, 30, 30)")
        .stroke("rgb(240, 30, 30)")
        .name("f4");

      chart.current
        .plot(0)
        .marker(MRBottomf5Mapping)
        .type("diagonal-cross")
        .fill("rgb(175, 58, 175)")
        .stroke("rgb(175, 58, 175)")
        .name("f5");

      chart.current
        .plot(0)
        .marker(MRBottomf6Mapping)
        .type("diagonal-cross")
        .fill("rgb(31, 9, 17)")
        .stroke("rgb(31, 9, 17)")
        .name("f6");
    } else {
      let seriesNames = ["f1", "f2", "f3", "f4", "f5", "f6"];
      let seriesMapping = {
        f1: MRBottomf1Mapping,
        f2: MRBottomf2Mapping,
        f3: MRBottomf3Mapping,
        f4: MRBottomf4Mapping,
        f5: MRBottomf5Mapping,
        f6: MRBottomf6Mapping,
      };
      let seriesLength = chart.current.plot(0).getSeriesCount();

      for (let i = seriesLength - 1 + 100; i > -1; i--) {
        if (chart.current.plot(0).getSeries(i)) {
          let seriesName = chart.current.plot(0).getSeries(i).name();
          if (seriesNames.includes(seriesName)) {
            console.log(seriesName);
            chart.current.plot(0).getSeries(i).data(seriesMapping[seriesName]);
          }
        }
      }
    }
  }
};

const addLinearRegression = async function (
  chart,
  interval,
  stockData,
  stockTool,
  ticker,
  adjustDividend,
  realStartTime,
  realEndTime,
  update = false
) {
  let apiInputParam = {};
  stockTool.parameters.forEach((opt) => {
    apiInputParam[opt.name] =
      Number.isNaN(+opt.value) || typeof opt.value == "boolean"
        ? opt.value
        : +opt.value;
  });
  const LinearRegressionresult = await indicatorApi.calculateLinearRegression({
    ...apiInputParam,
    ticker,
    interval,
    adjustDividend,
    startDate: realStartTime,
    endDate: realEndTime,
  });

  if (LinearRegressionresult) {
    let LinearRegressionUpperData = LinearRegressionresult.filter(
      (p) => p.upperChannelLine
    ).map((p) => {
      return [moment(p.date).valueOf(), p.upperChannelLine];
    });
    let LinearRegressionMedianData = LinearRegressionresult.filter(
      (p) => p.medianChannelLine
    ).map((p) => {
      return [moment(p.date).valueOf(), p.medianChannelLine];
    });
    let LinearRegressionLowerData = LinearRegressionresult.filter(
      (p) => p.lowerChannelLine
    ).map((p) => {
      return [moment(p.date).valueOf(), p.lowerChannelLine];
    });
    let LinearRegressionpvhData = LinearRegressionresult.map((p) => {
      return [moment(p.date).valueOf(), p.pvh];
    });
    let LinearRegressionpvlData = LinearRegressionresult.map((p) => {
      return [moment(p.date).valueOf(), p.pvl];
    });

    var LinearRegressionUpperTable = anychart.data.table();

    LinearRegressionUpperTable.addData(LinearRegressionUpperData);
    var LinearRegressionUpperMapping = LinearRegressionUpperTable.mapAs();
    LinearRegressionUpperMapping.addField("value", 1);

    var LinearRegressionMedianTable = anychart.data.table();

    LinearRegressionMedianTable.addData(LinearRegressionMedianData);
    var LinearRegressionMedianMapping = LinearRegressionMedianTable.mapAs();
    LinearRegressionMedianMapping.addField("value", 1);

    var LinearRegressionLowerTable = anychart.data.table();
    LinearRegressionLowerTable.addData(LinearRegressionLowerData);
    var LinearRegressionLowerMapping = LinearRegressionLowerTable.mapAs();
    LinearRegressionLowerMapping.addField("value", 1);

    var LinearRegressionpvhTable = anychart.data.table();
    LinearRegressionpvhTable.addData(LinearRegressionpvhData);
    var LinearRegressionpvhMapping = LinearRegressionpvhTable.mapAs();
    LinearRegressionpvhMapping.addField("value", 1);

    var LinearRegressionpvlTable = anychart.data.table();
    LinearRegressionpvlTable.addData(LinearRegressionpvlData);
    var LinearRegressionpvlMapping = LinearRegressionpvlTable.mapAs();
    LinearRegressionpvlMapping.addField("value", 1);

    if (!update) {
      chart.current
        .plot(0)
        .line(LinearRegressionUpperMapping)
        .stroke("#FF0000")
        .name("Upper Channel Line");

      chart.current
        .plot(0)
        .line(LinearRegressionMedianMapping)
        .stroke("#C0C000")
        .name("Middle Channel Line");

      chart.current
        .plot(0)
        .line(LinearRegressionLowerMapping)
        .stroke("#00FF00")
        .name("Lower Channel Line");

      if (
        stockTool.parameters.find((p) => p.name === "Display Pivot lines?")
          .value
      ) {
        chart.current
          .plot(0)
          .line(LinearRegressionpvhMapping)
          .stroke(stockTool.pivotHighStroke, 1, 1)
          .name("Pivot High");

        chart.current
          .plot(0)
          .line(LinearRegressionpvlMapping)
          .stroke(stockTool.pivotLowStroke, 1, 1)
          .name("Pivot Low");
      }
    } else {
      let seriesNames = [
        "Upper Channel Line",
        "Middle Channel Line",
        "Lower Channel Line",
      ];
      let seriesMapping = {
        "Upper Channel Line": LinearRegressionUpperMapping,
        "Middle Channel Line": LinearRegressionMedianMapping,
        "Lower Channel Line": LinearRegressionLowerMapping,
      };
      let switchNames = ["Pivot High", "Pivot Low"];
      let switchSeriesFound = {
        "Pivot High": false,
        "Pivot Low": false,
      };
      let switchSeriesMapping = {
        "Pivot High": LinearRegressionpvhMapping,
        "Pivot Low": LinearRegressionpvlMapping,
      };
      let switchSeriesStroke = {
        "Pivot High": stockTool.pivotHighStroke,
        "Pivot Low": stockTool.pivotLowStroke,
      };
      let seriesLength = chart.current.plot(0).getSeriesCount();

      for (let i = seriesLength - 1 + 100; i > -1; i--) {
        if (chart.current.plot(0).getSeries(i)) {
          let seriesName = chart.current.plot(0).getSeries(i).name();
          if (seriesNames.includes(seriesName)) {
            chart.current.plot(0).getSeries(i).data(seriesMapping[seriesName]);
          }
          if (switchNames.includes(seriesName)) {
            switchSeriesFound[seriesName] = true;
            if (
              stockTool.parameters.find(
                (p) => p.name === "Display Pivot lines?"
              ).value
            ) {
              chart.current
                .plot(0)
                .getSeries(i)
                .data(switchSeriesMapping[seriesName]);
            } else {
              chart.current.plot(0).removeSeries(i);
            }
          }
        }
      }

      if (
        stockTool.parameters.find((p) => p.name === "Display Pivot lines?")
          .value
      ) {
        for (let key in switchSeriesFound) {
          if (!switchSeriesFound[key]) {
            chart.current
              .plot(0)
              .line(switchSeriesMapping[key])
              .stroke(switchSeriesStroke[key], 1, 1)
              .name(key);
          }
        }
      }
    }
    let max = Math.max(
      ...LinearRegressionUpperData.map((p) => p[1]),
      ...LinearRegressionLowerData.map((p) => p[1]),
      stockData
        .filter(
          (p) =>
            p[0] > moment(realStartTime).valueOf() &&
            p[0] < moment(realEndTime).valueOf()
        )
        .map((p) => p[2])
    );
    let min = Math.min(
      ...LinearRegressionUpperData.map((p) => p[1]),
      ...LinearRegressionLowerData.map((p) => p[1]),
      stockData
        .filter(
          (p) =>
            p[0] > moment(realStartTime).valueOf() &&
            p[0] < moment(realEndTime).valueOf()
        )
        .map((p) => p[3])
    );
    // console.log(chart.current.plot(0).yScale().maximum());
    chart.current
      .plot(0)
      .yScale()
      .maximum(
        Math.max(max, chart.current.plot(0).yScale().maximum()).toFixed(2)
      );
    chart.current
      .plot(0)
      .yScale()
      .minimum(
        Math.min(min, chart.current.plot(0).yScale().minimum()).toFixed(2)
      );
    // console.log(max);
  }
};

const addZigZag = async function (
  chart,
  interval,
  stockData,
  stockTool,
  ticker,
  adjustDividend,
  realStartTime,
  realEndTime,
  update = false
) {
  let apiInputParam = {};
  stockTool.parameters.forEach((opt) => {
    apiInputParam[opt.name] =
      Number.isNaN(+opt.value) || typeof opt.value == "boolean"
        ? opt.value
        : +opt.value;
  });
  const Zigzagresult = await indicatorApi.calculateZigZag({
    ...apiInputParam,
    ticker,
    interval,
    adjustDividend,
    startDate: realStartTime,
    endDate: realEndTime,
  });

  if (Zigzagresult) {
    let ZigzagLowerData = Zigzagresult.filter((p) => p.lowerChannelLine).map(
      (p) => {
        return [moment(p.date).valueOf(), p.lowerChannelLine];
      }
    );
    let ZigzagMedianData = Zigzagresult.filter((p) => p.medianChannelLine).map(
      (p) => {
        return [moment(p.date).valueOf(), p.medianChannelLine];
      }
    );
    let ZigzagUpperData = Zigzagresult.filter((p) => p.upperChannelLine).map(
      (p) => {
        return [moment(p.date).valueOf(), p.upperChannelLine];
      }
    );
    let ZigzagData = Zigzagresult.filter((p) => p.value).map((p) => {
      return [moment(p.date).valueOf(), p.value, p.dirUp];
    });
    let ZigzagPredictData = Zigzagresult.filter((p) => p.predictive).map(
      (p) => {
        return [moment(p.date).valueOf(), p.predictive];
      }
    );
    let ZigzagPredictSecondData = Zigzagresult.filter(
      (p) => p.predictiveSecond
    ).map((p) => {
      return [moment(p.date).valueOf(), p.predictiveSecond];
    });
    let ZigzagLabelData = Zigzagresult.filter(
      (p) => p.pctLabel || p.RSIlabel
    ).map((p) => {
      return [
        moment(p.date).valueOf(),
        p.pctLabel,
        p.RSIlabel,
        p.lastlowUpdate,
        p.lastHighUpdate,
        p.lowerChannelLine,
      ];
    });

    let ZigzagLastLabelData = [
      moment(Zigzagresult[Zigzagresult.length - 1].date).valueOf(),
      Zigzagresult[Zigzagresult.length - 1].lastpLabel,
      Zigzagresult[Zigzagresult.length - 1].medianChannelLine,
    ];
    let ZigzagLastChangeLabelData = [
      moment(Zigzagresult[Zigzagresult.length - 1].date).valueOf(),
      Zigzagresult[Zigzagresult.length - 1].lastRSIlabel,
      Zigzagresult[Zigzagresult.length - 1].lastpct,
      Zigzagresult[Zigzagresult.length - 1].medianChannelLine,
    ];
    let ZigzagCountDownData = [
      moment(Zigzagresult[Zigzagresult.length - 1].date).valueOf(),
      Zigzagresult[Zigzagresult.length - 1].countdown + " bar",
      Zigzagresult[Zigzagresult.length - 1].medianChannelLine -
        Zigzagresult[Zigzagresult.length - 1].lastDeviation * 1.2,
    ];
    let ZigzagrsquareData = Zigzagresult.filter((p) => p.rsquarelabel).map(
      (p) => {
        return [moment(p.date).valueOf(), p.rsquarelabel, p.close];
      }
    );

    let ZigzagLowerTable = anychart.data.table();
    ZigzagLowerTable.addData(ZigzagLowerData);
    let ZigzagLowerMapping = ZigzagLowerTable.mapAs();
    ZigzagLowerMapping.addField("value", 1);

    let ZigzagMedianTable = anychart.data.table();
    ZigzagMedianTable.addData(ZigzagMedianData);
    let ZigzagMedianMapping = ZigzagMedianTable.mapAs();
    ZigzagMedianMapping.addField("value", 1);

    let ZigzagUpperTable = anychart.data.table();
    ZigzagUpperTable.addData(ZigzagUpperData);
    let ZigzagUpperMapping = ZigzagUpperTable.mapAs();
    ZigzagUpperMapping.addField("value", 1);

    let ZigzagPredictTable = anychart.data.table();
    ZigzagPredictTable.addData(ZigzagPredictData);
    let ZigzagPredictMapping = ZigzagPredictTable.mapAs();
    ZigzagPredictMapping.addField("value", 1);

    let ZigzagPredictSecondTable = anychart.data.table();
    ZigzagPredictSecondTable.addData(ZigzagPredictSecondData);
    let ZigzagPredictSecondMapping = ZigzagPredictSecondTable.mapAs();
    ZigzagPredictSecondMapping.addField("value", 1);

    annotationIndex.ZigZagannotationIndex.push(
      chart
        .plot(0)
        .annotations()
        .label({
          xAnchor: ZigzagrsquareData[0][0],
          valueAnchor: ZigzagrsquareData[0][2],
          text: ZigzagrsquareData[0][1],
          normal: {
            fontColor: stockTool.lastLabelRSIFontColor,
          },
          hovered: {
            fontColor: stockTool.lastLabelRSIFontColor,
          },
          selected: {
            fontColor: stockTool.lastLabelRSIFontColor,
          },
        })
        .background({
          fill: stockTool.lastLabelRSIFillColor,
          stroke: stockTool.lastLabelRSIFillColor,
        })
    );

    let zigzagLines = ZigzagData.map((p, idx) => {
      if (idx < ZigzagData.length - 1) {
        return {
          xAnchor: p[0],
          valueAnchor: p[1],
          secondXAnchor: ZigzagData[idx + 1][0],
          secondValueAnchor: ZigzagData[idx + 1][1],
          stroke: {
            color: p[2] ? "rgb(0, 230, 118)" : "rgb(33,150,243)",
          },
        };
      }
    });

    zigzagLines.forEach((zigzagLine) => {
      annotationIndex.ZigZagannotationIndex.push(
        chart.plot(0).annotations().line(zigzagLine)
      );
    });
    let zigzagPredictiveLines = ZigzagPredictData.filter(
      (p, idx) => idx < ZigzagPredictData.length - 1
    ).map((p, idx) => {
      return {
        xAnchor: p[0],
        valueAnchor: p[1],
        secondXAnchor: ZigzagPredictData[idx + 1][0],
        secondValueAnchor: ZigzagPredictData[idx + 1][1],
        stroke: {
          color: stockTool.zigzagPredictiveStrokeColor,
          dash: "2 2",
        },
      };
    });
    zigzagPredictiveLines.forEach((zigzagPredictiveLine) => {
      annotationIndex.ZigZagannotationIndex.push(
        chart.plot(0).annotations().line(zigzagPredictiveLine)
      );
    });
    let zigzagSecondPredictiveLines = ZigzagPredictSecondData.filter(
      (p, idx) => idx < ZigzagPredictSecondData.length - 1
    ).map((p, idx) => {
      return {
        xAnchor: p[0],
        valueAnchor: p[1],
        secondXAnchor: ZigzagPredictSecondData[idx + 1][0],
        secondValueAnchor: ZigzagPredictSecondData[idx + 1][1],
        stroke: {
          color: stockTool.zigzagSecondPredictiveStrokeColor,
          dash: "2 2",
        },
      };
    });
    zigzagSecondPredictiveLines.forEach((zigzagSecondPredictiveLine) => {
      annotationIndex.ZigZagannotationIndex.push(
        chart.plot(0).annotations().line(zigzagSecondPredictiveLine)
      );
    });
    var zigzagLabels = [];
    zigzagLabels = ZigzagLabelData.map((p, idx) => {
      return {
        xAnchor: p[0],
        valueAnchor: p[5],
        text: p[1],
        normal: {
          fontColor: stockTool.zigzagFontColor,
        },
        hovered: {
          fontColor: stockTool.zigzagFontColor,
        },
        selected: {
          fontColor: stockTool.zigzagFontColor,
        },
        lastlowUpdate: p[3],
        lastHighUpdate: p[4],
      };
    });
    annotationIndex.ZigZagannotationIndex.push(
      chart
        .plot(0)
        .annotations()
        .label({
          xAnchor: ZigzagLastChangeLabelData[0],
          valueAnchor: ZigzagLastChangeLabelData[3],
          text: ZigzagLastChangeLabelData[2],
          normal: {
            fontColor: stockTool.lastLabelRSIFontColor,
          },
          hovered: {
            fontColor: stockTool.lastLabelRSIFontColor,
          },
          selected: {
            fontColor: stockTool.lastLabelRSIFontColor,
          },
        })
        .background({
          fill: stockTool.lastLabelRSIFillColor,
          stroke: stockTool.lastLabelRSIFillColor,
        })
    );

    annotationIndex.ZigZagannotationIndex.push(
      chart
        .plot(0)
        .annotations()
        .label({
          xAnchor: ZigzagLastChangeLabelData[0],
          valueAnchor: ZigzagLastChangeLabelData[3],
          text: ZigzagLastChangeLabelData[1],
          normal: {
            fontColor: stockTool.lastLabelFontColor,
          },
          hovered: {
            fontColor: stockTool.lastLabelFontColor,
          },
          selected: {
            fontColor: stockTool.lastLabelFontColor,
          },
        })
        .background({
          fill: stockTool.lastLabelFillColor,
          stroke: stockTool.lastLabelFillColor,
        })
    );

    zigzagLabels.forEach((zigzagLabel) => {
      annotationIndex.ZigZagannotationIndex.push(
        chart
          .plot(0)
          .annotations()
          .label(zigzagLabel)
          .background({
            fill: zigzagLabel.lastlowUpdate
              ? stockTool.lastlowUpdateFontColor
              : stockTool.lastHighUpdateFontColor,
            stroke: zigzagLabel.lastlowUpdate
              ? stockTool.lastlowUpdateFontColor
              : stockTool.lastHighUpdateFontColor,
          })
      );
    });
    annotationIndex.ZigZagannotationIndex.push(
      chart
        .plot(0)
        .annotations()
        .label({
          xAnchor: ZigzagLastLabelData[0],
          valueAnchor: ZigzagLastLabelData[2],
          text: ZigzagLastLabelData[1],
          normal: {
            fontColor: stockTool.lastLabelFontColor,
          },
          hovered: {
            fontColor: stockTool.lastLabelFontColor,
          },
          selected: {
            fontColor: stockTool.lastLabelFontColor,
          },
        })
        .background({
          fill: stockTool.lastLabelFillColor,
          stroke: stockTool.lastLabelFillColor,
        })
    );
    annotationIndex.ZigZagannotationIndex.push(
      chart
        .plot(0)
        .annotations()
        .label({
          xAnchor: ZigzagCountDownData[0],
          valueAnchor: ZigzagCountDownData[2],
          text: ZigzagCountDownData[1],
          normal: {
            fontColor: stockTool.lastLabelFontColor,
          },
          hovered: {
            fontColor: stockTool.lastLabelFontColor,
          },
          selected: {
            fontColor: stockTool.lastLabelFontColor,
          },
        })
        .background({
          fill: stockTool.lastLabelCountDownFillColor,
          stroke: stockTool.lastLabelCountDownFillColor,
        })
    );

    if (!update) {
      chart
        .plot(0)
        .line(ZigzagUpperMapping)
        .stroke("#FF0000")
        .name("Upper Linear Regression Line");
      chart
        .plot(0)
        .line(ZigzagMedianMapping)
        .stroke("#C0C000")
        .name("Median Linear Regression Line");
      chart
        .plot(0)
        .line(ZigzagLowerMapping)
        .stroke("#00FF00")
        .name("Lower Linear Regression Line");
    } else {
      let seriesNames = [
        "Upper Linear Regression Line",
        "Median Linear Regression Line",
        "Lower Linear Regression Line",
      ];
      let seriesMapping = {
        "Upper Linear Regression Line": ZigzagUpperMapping,
        "Median Linear Regression Line": ZigzagMedianMapping,
        "Lower Linear Regression Line": ZigzagLowerMapping,
      };

      let seriesLength = chart.plot(0).getSeriesCount();

      for (let i = seriesLength - 1 + 100; i > -1; i--) {
        if (chart.plot(0).getSeries(i)) {
          let seriesName = chart.plot(0).getSeries(i).name();
          if (seriesNames.includes(seriesName)) {
            chart.plot(0).getSeries(i).data(seriesMapping[seriesName]);
          }
        }
      }
    }
  }
};

function TheChart(props) {
  console.log("function rerender??");
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
      console.log("does addIndicator get called?");
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
          console.log(allResult);
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

        // console.log(allResult);

        // addResult.reverse();
        console.log(addResult);
        var table = anychart.data.table();
        table.addData(addResult);
        console.log(addResult);
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
              // console.log(this.x);
              let resultIndex = addResult.findIndex(
                // (p) => p[0] === moment(this.x).valueOf()
                // (p) => moment(p[0]).valueOf() === moment.utc(this.x).valueOf()
                (p) => this.value === p[1]
              );
              if (resultIndex < 0) {
                // console.log(this.x);
                // console.log(addResult);
                console.log(this);
                return this.sourceColor;
              }
              if (!addResult[resultIndex - 1]) return;
              let prevValue = addResult[resultIndex - 1][1];

              let strokeColor = "";
              let conditions_temp = "";
              // console.log("is this still affecting??");

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
        // console.log(
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
            console.log(annotations[index]);
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
    console.log("RUNNING");
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
    console.log(newStockData);
    setStockData(newStockData);
    // dispatch(stockActions.setStockData(newStockData)) // not working
    exchangeTimeZone.current = {
      name: "Exchange",
      value: Number(data.meta.gmtoffset) / 3600,
    };

    if (Object.keys(timezone).length === 0) {
      setTimezone(exchangeTimeZone.current);
      console.log("triggered?");
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
    console.log(intervalChar);
    console.log(subtractValue);
    console.log(subtractUnit);
    let startRange = moment(newStockData[newStockData.length - 1][0]).subtract(
      subtractValue,
      subtractUnit
    );
    let endRange = moment(newStockData[newStockData.length - 1][0]);
    console.log(startRange.valueOf());
    console.log(endRange.valueOf());
    chart.current.selectRange(
      moment().subtract(subtractValue, subtractUnit).valueOf(),
      moment().valueOf()
    );
    var max = getStockMax(newStockData, startRange, endRange);
    var min = getStockMin(newStockData, startRange, endRange);
    console.log(max);
    console.log(min);

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

  const addStockTool = useCallback(
    async (stockTool) => {
      console.log(stockTool);

      if (stockTool.name === "Volume Profile") {
        await drawVolumeProfileFunction(
          stockTool,
          chart,
          ticker,
          interval,
          adjustDividend,
          realTime
        );
      }
      if (stockTool.name === "Pivot Hi Lo") {
        await addFline(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate
        );
      }

      if (stockTool.name === "52 Wk Hi Lo Range - Buy Sell") {
        await addWkHiLo(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate,
          plotIndex,
          false
        );

        // dispatch(
        //   indicatorActions.setToolChartPlotIndex({
        //     stockToolName: stockTool.name,
        //     plotIndex: wkHiLoChartIndex,
        //   })
        // );

        stockTool = { ...stockTool, plotIndex: wkHiLoChartIndex };
      }

      if (stockTool.name === "MR Bottom Detector") {
        await addMRButton(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate
        );
      }
      if (stockTool.name === "Linear Regression Channel on Pivot") {
        await addLinearRegression(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate
        );
      }
      if (stockTool.name === "Zig Zag + LR") {
        await addZigZag(
          chart.current,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          startDate,
          endDate
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
    ]
  );

  const updateStockTool = useCallback(
    async (stockTool, index) => {
      if (stockTool.name === "Volume Profile") {
        console.log(annotationIndex.VolumeProfileannotationIndex);
        annotationIndex.VolumeProfileannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.VolumeProfileannotationIndex = [];

        // dispatch(indicatorActions.removeSelectedStockTool(index));
        // dispatch(indicatorActions.addStockTools(stockTool));
        await drawVolumeProfileFunction(
          stockTool,
          chart,
          ticker,
          interval,
          adjustDividend,
          realTime
        );
      }
      if (stockTool.name === "Pivot Hi Lo") {
        annotationIndex.FLineannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.FLineannotationIndex = [];

        await addFline(
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
        await addWkHiLo(
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
      if (stockTool.name === "MR Bottom Detector") {
        await addMRButton(
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
      if (stockTool.name === "Linear Regression Channel on Pivot") {
        await addLinearRegression(
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
        await addZigZag(
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
        annotationIndex.FLineannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.FLineannotationIndex = [];
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
        FLineMax = Math.max(...stockMax);
        FLineMin = Math.min(...stockMin);

        chart.current.plot(0).yScale().maximum(FLineMax.toFixed(2));
        chart.current.plot(0).yScale().minimum(FLineMin.toFixed(2));
      }
      if (ind.name === "52 Wk Hi Lo Range - Buy Sell") {
        var seriesLengthWkHi = chart.current
          .plot(wkHiLoChartIndex)
          .getSeriesCount();
        for (let i = seriesLengthWkHi - 1 + 100; i > -1; i--) {
          if (chart.current.plot(wkHiLoChartIndex).getSeries(i)) {
            let seriesNameWkHi = chart.current
              .plot(wkHiLoChartIndex)
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
              chart.current.plot(wkHiLoChartIndex).removeSeries(i);
            }
          }
        }

        if (chart.current.plot(wkHiLoChartIndex).getSeriesCount() < 1) {
          chart.current.plot(wkHiLoChartIndex).dispose();
          plotIndex.current -= 1;
        }
      }
      if (ind.name === "MR Bottom Detector") {
        var seriesLengthMRButtom = chart.current.plot(0).getSeriesCount();
        for (let i = seriesLengthMRButtom - 1 + 100; i > -1; i--) {
          if (chart.current.plot(0).getSeries(i)) {
            let seriesNameMRButtom = chart.current.plot(0).getSeries(i).name();
            if (
              seriesNameMRButtom === "f1" ||
              seriesNameMRButtom === "f2" ||
              seriesNameMRButtom === "f3" ||
              seriesNameMRButtom === "f4" ||
              seriesNameMRButtom === "f5" ||
              seriesNameMRButtom === "f6"
            ) {
              chart.current.plot(0).removeSeries(i);
            }
          }
        }
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
      }
    },
    [chart, stockData, dispatch, plotIndex]
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
      console.log(ind);

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
      console.log(allPlots);

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
      console.log(indicator);
      var annotations =
        "annotations" in indicator
          ? indicator.annotations.map((item) => ({
              ...item,
              annotationIndex: [...item.annotationIndex],
            }))
          : [];
      let apiInputParam = {};
      console.log(indicator.parameters);
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
        console.log(numOfCharts);

        indicatorIndex = [];

        for (let index = 0; index < numOfCharts; index++) {
          result_temp = [];
          for (let r = 0; r < allResult.length; r++) {
            if ("range" in filterCharts[index]) {
              console.log(filterCharts[index]);
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
          console.log(result_temp);
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
          console.log(indicatorIndex[j].result);
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

            console.log("data is mapping");
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
              console.log(annotations[index]);
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
          console.log(apiInputParam);
          console.log(condResult);
          if (condResult) {
            console.log(seriesIndex);
            if (seriesIndex > -1) {
              console.log(indicator.charts[k]);
              console.log(seriesIndex);
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
            console.log(seriesIndex);
            if (seriesIndex === -1) {
              console.log(seriesIndex);
              let allResult = await indicatorCallback(indicator.apiFunc, {
                ...apiInputParam,
                ticker,
                interval,
                adjustDividend,
                startDate,
                endDate,
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
              console.log(addResult);
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
    [adjustDividend, dispatch, interval, realTime, ticker, startDate, endDate]
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
            addStockTool={addStockTool}
            updateStockTool={updateStockTool}
            removeStockTool={removeStockTool}
            toggleRealTime={toggleRealTime}
            changeTimeZone={changeTimeZone}
            adjustDividend={adjustDividend}
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
            initialPicked={initialPicked}
            addIndicator={addIndicator}
            addStockTool={addStockTool}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default TheChart;
