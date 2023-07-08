import "./ChartTopBar.css";

import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  Col,
  Row,
} from "react-bootstrap";

import { Icon } from "@iconify/react";
import { FiTool } from "react-icons/fi";

import intervalSelection from "./INTERVAL";
import timezoneSelection from "./TIMEZONE";

import IndicatorSettings from "../settings/IndicatorSettings";
import StockToolSettings from "../settings/StockToolSettings";
import DrawToolBar from "./DrawToolBar";
import { useCallback } from "react";

import { indicatorActions } from "../../store/indicator-slice";

import indicatorApi from "../../api/indicator";
import moment from "moment";
import anychart from "anychart";

import annotationIndex from "../chart/annotationIndex";

const intervalSelectedName = (interval) => {
  let intervalTitle = "";

  for (const intervalGroup in intervalSelection) {
    let intervalSelectFind = intervalSelection[intervalGroup].find(
      (p) => p.value === interval
    );
    if (intervalSelectFind) {
      intervalTitle = intervalSelectFind.name;
      break;
    }
  }
  return intervalTitle;
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

const drawVolumeProfileFunction = (stockTool, chart, stockData) => {
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
    startDate: realStartTime.current,
    endDate: realEndTime.current,
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
    startDate: realStartTime.current,
    endDate: realEndTime.current,
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
    startDate: realStartTime.current,
    endDate: realEndTime.current,
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
    startDate: realStartTime.current,
    endDate: realEndTime.current,
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
  }
};

function ChartTopBar(props) {
  const {
    chart,
    stockData,
    ticker,
    interval,
    adjustDividend,
    realStartTime,
    realEndTime,
    plotIndex,
  } = props;
  const indicators = useSelector((state) => state.indicator.indicators);
  const currentIndicators = useSelector(
    (state) => state.indicator.currentIndicators
  );
  const stockTools = useSelector((state) => state.indicator.stockTools);
  const currentStockTools = useSelector(
    (state) => state.indicator.currentStockTools
  );
  const dispatch = useDispatch();

  const addStockTool = useCallback(
    async (stockTool) => {
      console.log(stockTool);
      if (currentStockTools.map((p) => p.name).includes(stockTool.name)) {
        return;
      }

      if (stockTool.name === "Volume Profile") {
        dispatch(indicatorActions.addStockTools(stockTool));
        drawVolumeProfileFunction(stockTool, chart, stockData);
        // VoluemProfileListenkey = chart.current.listen(
        //   "selectedrangechangefinish",
        //   function (e) {
        //     annotationIndex.VolumeProfileannotationIndex.forEach((elem) => {
        //       chart.current.plot(0).annotations().removeAnnotation(elem);
        //     });
        //     annotationIndex.VolumeProfileannotationIndex = [];
        //   }
        // );
      }
      if (stockTool.name === "Pivot Hi Lo") {
        dispatch(indicatorActions.addStockTools(stockTool));
        await addFline(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          realStartTime,
          realEndTime
        );
      }

      if (stockTool.name === "52 Wk Hi Lo Range - Buy Sell") {
        dispatch(indicatorActions.addStockTools(stockTool));
        await addWkHiLo(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          realStartTime,
          realEndTime,
          plotIndex,
          false
        );

        dispatch(
          indicatorActions.setToolChartPlotIndex({
            stockToolName: stockTool.name,
            plotIndex: wkHiLoChartIndex,
          })
        );
      }

      if (stockTool.name === "MR Bottom Detector") {
        dispatch(indicatorActions.addStockTools(stockTool));
        await addMRButton(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          realStartTime,
          realEndTime
        );
      }
      if (stockTool.name === "Linear Regression Channel on Pivot") {
        dispatch(indicatorActions.addStockTools(stockTool));
        await addLinearRegression(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          realStartTime,
          realEndTime
        );
      }
    },
    [
      chart,
      stockData,
      dispatch,
      ticker,
      interval,
      adjustDividend,
      realStartTime,
      realEndTime,
      currentStockTools,
      plotIndex,
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

        dispatch(indicatorActions.removeSelectedStockTool(index));
        dispatch(indicatorActions.addStockTools(stockTool));
        drawVolumeProfileFunction(stockTool, chart, stockData);
      }
      if (stockTool.name === "Pivot Hi Lo") {
        FLineannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        FLineannotationIndex = [];

        await addFline(
          chart,
          interval,
          stockData,
          stockTool,
          ticker,
          adjustDividend,
          realStartTime,
          realEndTime,
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
          realStartTime,
          realEndTime,
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
          realStartTime,
          realEndTime,
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
          realStartTime,
          realEndTime,
          true
        );
      }
    },
    [
      dispatch,
      chart,
      interval,
      stockData,
      ticker,
      adjustDividend,
      realStartTime,
      realEndTime,
      plotIndex,
    ]
  );
  const removeStockTool = useCallback(
    (ind, index) => {
      if (ind.name === "Volume Profile") {
        annotationIndex.VolumeProfileannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        annotationIndex.VolumeProfileannotationIndex = [];
        console.log(index);
        dispatch(indicatorActions.removeSelectedStockTool(index));
      }
      if (ind.name === "Pivot Hi Lo") {
        FLineannotationIndex.forEach((elem) => {
          chart.current.plot(0).annotations().removeAnnotation(elem);
        });
        FLineannotationIndex = [];
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
    },
    [chart, stockData, dispatch, plotIndex]
  );

  return (
    <>
      <Row>
        <Col>
          <main className="main">
            <Dropdown>
              <Dropdown.Toggle variant="light" id="dropdown-interval" size="sm">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="tooltip-interval">
                      {intervalSelectedName(props.interval)}
                    </Tooltip>
                  }
                >
                  <span>{props.interval}</span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Object.keys(intervalSelection).map((key, index) => {
                  return (
                    <div key={key}>
                      <Dropdown.Header key={key + index}>{key}</Dropdown.Header>
                      {intervalSelection[key].map((interval) => (
                        <Dropdown.Item
                          as="button"
                          key={interval.name + key}
                          onClick={() => props.changeInterval(interval)}
                        >
                          {interval.name}
                        </Dropdown.Item>
                      ))}
                    </div>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                id="dropdown-indicator"
                size="sm"
              >
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="tooltip-indicator">
                      Select Indicators
                    </Tooltip>
                  }
                >
                  <span>
                    <Icon icon="mdi:finance" /> Indicators
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Object.keys(indicators).map((key, index) => {
                  return (
                    <div key={key}>
                      <Dropdown.Header key={key + index}>{key}</Dropdown.Header>
                      {indicators[key].map((ind) => (
                        <Dropdown.Item
                          as="button"
                          key={ind.name + key}
                          onClick={() => props.addIndicator(ind)}
                          active={currentIndicators
                            .map((opt) => opt.value)
                            .includes(ind.value)}
                        >
                          {ind.name}
                        </Dropdown.Item>
                      ))}
                    </div>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                id="dropdown-stocktool"
                size="sm"
              >
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="tooltip-stocktool">
                      Select Stock Tool
                    </Tooltip>
                  }
                >
                  <span>
                    <FiTool />
                    Stock Tools
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <div>
                  {stockTools.map((tool, index) => {
                    return (
                      <Dropdown.Item
                        as="button"
                        key={index}
                        onClick={() => addStockTool(tool)}
                        active={currentStockTools
                          .map((opt) => opt.name)
                          .includes(tool.name)}
                      >
                        {tool.name}
                      </Dropdown.Item>
                    );
                  })}
                </div>
              </Dropdown.Menu>
            </Dropdown>
            <Button
              variant="light"
              size="sm"
              onClick={props.toggleRealTime}
              active={props.realTime}
            >
              Toggle realtime
            </Button>
            <Dropdown>
              <Dropdown.Toggle variant="light" id="dropdown-timezone" size="sm">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="tooltip-timezone">
                      Change Timezone
                    </Tooltip>
                  }
                >
                  <span>
                    {"UTC(" +
                      (props.timezone.value > 0 ? "+" : "") +
                      props.timezone.value +
                      ")"}
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  as="button"
                  onClick={() =>
                    props.changeTimeZone({ name: "UTC", value: 0 })
                  }
                  active={props.timezone.value === 0}
                >
                  UTC
                </Dropdown.Item>
                <Dropdown.Item
                  as="button"
                  onClick={() =>
                    props.changeTimeZone({ name: "Exchange", value: 0 })
                  }
                  active={props.timezone.name === "Exchange"}
                >
                  Exchange
                </Dropdown.Item>
                {timezoneSelection.map((timezone) => (
                  <Dropdown.Item
                    as="button"
                    key={timezone.name}
                    onClick={() => props.changeTimeZone(timezone)}
                    active={timezone.value === props.timezone.value}
                  >
                    {"UTC(" +
                      (timezone.value > 0 ? "+" : "") +
                      timezone.value +
                      ")" +
                      timezone.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </main>
        </Col>
      </Row>
      <Row>
        <Col>
          <IndicatorSettings
            updateIndicator={props.updateIndicator}
            removeIndicator={props.removeIndicator}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <StockToolSettings
            updateStockTool={updateStockTool}
            removeStockTool={removeStockTool}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <DrawToolBar chart={props.chart} />
        </Col>
      </Row>
    </>
  );
}

export default ChartTopBar;
