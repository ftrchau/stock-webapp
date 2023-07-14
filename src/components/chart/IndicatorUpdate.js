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

const addWkHiLo = async function (
  chart,
  interval,
  stockData,
  stockTool,
  ticker,
  adjustDividend,
  startDate,
  endDate,
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
    startDate: startDate,
    endDate: endDate,
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
        .plot(plotIndex)
        .line(WkHiLoRangeHHpctMapping)
        .stroke("rgb(0, 188, 212)")
        .name("on High");
      chart.current
        .plot(plotIndex)
        .line(WkHiLoRangeLLpctMapping)
        .stroke("rgb(255, 152, 0)")
        .name("on Low");
      chart.current
        .plot(plotIndex)
        .line(UBLineMapping)
        .stroke("rgb(255, 82, 82)")
        .name("UB");
      chart.current
        .plot(plotIndex)
        .line(LBLineMapping)
        .stroke("rgb(255, 82, 82)")
        .name("LB");
      chart.current
        .plot(plotIndex)
        .line(MidLineMapping)
        .stroke("rgb(255, 82, 82)")
        .name("Mid");
      chart.current
        .plot(plotIndex)
        .line(WkHiLoRangeblineMapping)
        .stroke("#800020")
        .name("bline");
      chart.current
        .plot(plotIndex)
        .line(WkHiLoRangeslineMapping)
        .stroke("#087830")
        .name("sline");
      //   wkHiLoChartIndex = plotIndex.current + 1;
      //   plotIndex.current += 1;
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
      let seriesLength = chart.current
        .plot(stockTool.chartIndex)
        .getSeriesCount();

      for (let i = seriesLength - 1 + 100; i > -1; i--) {
        if (chart.current.plot(stockTool.chartIndex).getSeries(i)) {
          let seriesName = chart.current
            .plot(stockTool.chartIndex)
            .getSeries(i)
            .name();
          if (seriesNames.includes(seriesName)) {
            console.log(seriesName);
            chart.current
              .plot(stockTool.chartIndex)
              .getSeries(i)
              .data(seriesMapping[seriesName]);
          }
        }
      }
    }
  }
};

const addLinearRegression = async function (
  chart,
  interval,
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
  const LinearRegressionresult = await indicatorApi.calculateLinearRegression({
    ...apiInputParam,
    ticker,
    interval,
    adjustDividend,
    startDate: startDate,
    endDate: endDate,
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
  annotationIndex.FLineannotationIndex = [];
  var controller = chart.plot(0).annotations();
  if (!stockData[stockData.length - 1]) return;
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
    startDate: startDate,
    endDate: endDate,
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
  stockData,
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

const addMRButton = async function (
  chart,
  interval,
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

const addZigZag = async function (
  chart,
  interval,
  stockTool,
  ticker,
  adjustDividend,
  realStartTime,
  realEndTime,
  update = false
) {
  if (!chart.current) return;
  annotationIndex.ZigZagannotationIndex = [];
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
      chart.current
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

    let zigzagLines = ZigzagData.filter(
      (p, idx) => idx < ZigzagData.length - 1
    ).map((p, idx) => {
      return {
        xAnchor: p[0],
        valueAnchor: p[1],
        secondXAnchor: ZigzagData[idx + 1][0],
        secondValueAnchor: ZigzagData[idx + 1][1],
        stroke: {
          color: p[2] ? "rgb(0, 230, 118)" : "rgb(33,150,243)",
        },
      };
    });

    zigzagLines.forEach((zigzagLine) => {
      annotationIndex.ZigZagannotationIndex.push(
        chart.current.plot(0).annotations().line(zigzagLine)
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
        chart.current.plot(0).annotations().line(zigzagPredictiveLine)
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
        chart.current.plot(0).annotations().line(zigzagSecondPredictiveLine)
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
      chart.current
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
      chart.current
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
        chart.current
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
      chart.current
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
      chart.current
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
      chart.current
        .plot(0)
        .line(ZigzagUpperMapping)
        .stroke("#FF0000")
        .name("Upper Linear Regression Line");
      chart.current
        .plot(0)
        .line(ZigzagMedianMapping)
        .stroke("#C0C000")
        .name("Median Linear Regression Line");
      chart.current
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
  }
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
    console.log("rerender IndicatorUpdate");
    if (chart.current) {
      const fetchCurrentIndicators = async () => {
        let cur = 0;
        for await (let indicator of currentIndicators) {
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
            apiInputParam[opt.name] = Number.isNaN(+opt.value)
              ? opt.value
              : +opt.value;
          });
          var foundCharts = [];
          console.log(indicator.charts);
          for (let ch = 0; ch < indicator.charts.length; ch++) {
            console.log(indicator.charts[ch]);
            var plotAddedBy = 0;
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

          console.log(foundCharts);

          // if (foundCharts.length > 0) continue;

          let apiInput = {
            ...apiInputParam,
            ticker,
            interval,
            adjustDividend,
            startDate: startDate,
            realTime,
          };

          if (!realTime) {
            apiInput.endDate = endDate;
          } else {
            apiInput.startDate =
              moment(tradingPeriod.regularStart, moment.ISO_8601).valueOf() /
              Math.pow(10, 3);
          }

          let allResult = await indicatorCallback(indicator.apiFunc, apiInput);

          let addResult;

          for (let p = 0; p < indicator.charts.length; p++) {
            var findChart = false;
            var seriesLength = chart.current
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
              console.log(allResult);
              addResult = allResult
                .filter(
                  (value, index) =>
                    index >=
                      allResult.length -
                        1 -
                        indicator.charts[p].range.startOffset &&
                    index <=
                      allResult.length - 1 - indicator.charts[p].range.endOffset
                )
                .map((r, index) => {
                  return [
                    moment(r.date).valueOf(),
                    +r[indicator.charts[r].column],
                  ];
                });
            } else {
              addResult = allResult.map((r, index) => {
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
                    // eslint-disable-next-line no-loop-func
                    indicator.charts[p].seriesType === "column"
                      ? "fill"
                      : "stroke"
                    // eslint-disable-next-line no-loop-func
                  ](function () {
                    if (!this.value) return this.sourceColor;
                    // console.log(this.x);
                    let resultIndex = addResult.findIndex(
                      // (p) => p[0] === moment(this.x).valueOf()
                      (p) => p[1] === this.value
                    );
                    if (!addResult[resultIndex - 1]) return;
                    let prevValue = addResult[resultIndex - 1][1];

                    let strokeColor = "";
                    let conditions_temp = "";
                    // console.log("is this still affecting??");

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
                                  allResult
                                )
                              : indicator.charts[p].stroke[i].conditions[j](
                                  this,
                                  resultIndex,
                                  allResult
                                );
                        }
                      }
                      if (conditions_temp) {
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
                ](indicator.charts[p].stroke);
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

              for (let s = 0; s < annoMappings.length; s++) {
                let annoMapping = annoMappings[s];
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
              }
            }

            console.log(cur);

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
            await drawVolumeProfileFunction(
              newStockData,
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
            await addWkHiLo(
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
            await addMRButton(
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
          if (stockTool.name === "Linear Regression Channel on Pivot") {
            await addLinearRegression(
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
            await addZigZag(
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
        }
      };

      //   chart.current.plot(0).removeAllSeries();
      if (needUpdate) {
        fetchCurrentIndicators();
        fetchCurrentStockTools();
        console.log(rangeStartDate);
        console.log(rangeEndDate);
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

        addIndicatorCallback();
        addStockToolCallback();
        dispatch(indicatorActions.setInitialLoad(false));
      }

      if (realTime) {
        indicatorUpdateInterval = setInterval(() => {
          fetchCurrentIndicators();
          // fetchCurrentStockTools();
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
