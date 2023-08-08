import moment from "moment";
import anychart from "anychart";

import annotationIndex from "./annotationIndex";

import stockApi from "../../api/stock";
import indicatorApi from "../../api/indicator";

var FLineMax = 0;
var FLineMin = 0;
var IntraATRMax = 0;
var IntraATRMin = 0;

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

const drawFLine = (
  chart,
  interval,
  stockData,
  lastPvh,
  lastPvl,
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

  // console.log(lastPoint);
  // console.log(stockData);
  // console.log(lastPvl);
  // console.log(lastPvh);

  var line = controller.line({
    xAnchor: lastPvl[0],
    valueAnchor: base,
    secondXAnchor: lastPoint,
    secondValueAnchor: base,
    normal: { stroke: "1 #00E676" },
  });
  annotationIndex.FLineannotationIndex.push(line);
  var label = controller.label({
    xAnchor: moment(lastPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
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
    xAnchor: moment(lastPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
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
    xAnchor: moment(lastPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
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
    xAnchor: moment(lastPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
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
    xAnchor: moment(lastPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
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
    xAnchor: moment(lastPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
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
    xAnchor: moment(lastPvl[0]).add(2, intervalTimeUnit(interval)).valueOf(),
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
  stockDataStore.FLineMax = Math.max(...stockMax, base, base + 1.236 * dd * ud);
  stockDataStore.FLineMin = Math.min(...stockMin, base, base + 1.236 * dd * ud);

  chart
    .plot(0)
    .yScale()
    .maximum((stockDataStore.FLineMax * 1.01).toFixed(2));
  chart
    .plot(0)
    .yScale()
    .minimum((stockDataStore.FLineMin * 0.99).toFixed(2));

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

let stockDataStore = {
  stockData: [],
  FLineMax: 0,
  FLineMin: 0,
  IntraATRMax: 0,
  IntraATRMin: 0,
  wkHiLoChartIndex: 0,
  VIXTopBottomChartIndex: null,
  kochartIndex: null,
  async drawVolumeProfileFunction(
    stockTool,
    chart,
    ticker,
    interval,
    adjustDividend,
    realTime
  ) {
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

    ////console.log(apiResult);

    let stockData = outputStockData(apiResult, adjustDividend);

    let visibleStockData = stockData.filter((p) => {
      return startPoint <= p[0] && endPoint >= p[0];
    });

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
      ////console.log(visibleStockData);

      let bodyvol =
        (body * visibleStockData[bars][5]) /
        (2 * topwick + 2 * bottomwick + body);
      let topwickvol =
        (2 * topwick * visibleStockData[bars][5]) /
        (2 * topwick + 2 * bottomwick + body);
      let bottomwickvol =
        (2 * bottomwick * visibleStockData[bars][5]) /
        (2 * topwick + 2 * bottomwick + body);
      ////console.log(body_bot);
      ////console.log(body_top);
      ////console.log(body);
      ////console.log(bodyvol);

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

    ////console.log(cnum);
    ////console.log(startPoint);
    ////console.log(levels);
    ////console.log(volumes);

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
              startPoint +
              Math.round(volumes[j]) +
              Math.round(volumes[j + cnum]),
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
  },
  async addFbLine(
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
    const PivotHiLoresult = await indicatorApi.calculateFibo({
      ...apiInputParam,
      ticker,
      interval,
      adjustDividend,
      startDate: realStartTime,
      endDate: realEndTime,
    });

    var lastPvh = [];
    var lastPvl = [];

    if (PivotHiLoresult.result) {
      let PivotHiLopvhData = PivotHiLoresult.result.map((p) => {
        return [moment(p.date).valueOf(), p.pvh];
      });
      let PivotHiLopvlData = PivotHiLoresult.result.map((p) => {
        return [moment(p.date).valueOf(), p.pvl];
      });
      ////console.log(PivotHiLoresult);
      if (
        stockTool.parameters.find((param) => param.name === "fiboPeriod")
          .value === "My input"
      ) {
        lastPvh = PivotHiLoresult.drawParameters.lastPvh;
        lastPvl = PivotHiLoresult.drawParameters.lastPvl;
      } else {
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
      }

      if (lastPvh.length > 0 && lastPvl.length > 0) {
        drawFLine(
          chart.current,
          interval,
          stockData,
          lastPvh,
          lastPvl,
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
            -1,
            0,
            false,
            false,
            stockTool.name
          );
        }
      }
    }
  },
  async addFline(
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
              chart.current
                .plot(0)
                .getSeries(i)
                .data(seriesMapping[seriesName]);
            }
          }
        }
      }
    }
  },
  async addWkHiLo(
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

    annotationIndex.WkHiLoRangeannotationIndex.forEach((elem) => {
      chart.current
        .plot(stockDataStore.wkHiLoChartIndex)
        .annotations()
        .removeAnnotation(elem);
    });
    annotationIndex.WkHiLoRangeannotationIndex = [];
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
    ////console.log(WkHiLoRangeresult);
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
        stockDataStore.wkHiLoChartIndex = plotIndex.current + 1;
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
        };
        let seriesLength = chart.current
          .plot(stockDataStore.wkHiLoChartIndex)
          .getSeriesCount();

        for (let i = seriesLength - 1 + 100; i > -1; i--) {
          if (
            chart.current.plot(stockDataStore.wkHiLoChartIndex).getSeries(i)
          ) {
            let seriesName = chart.current
              .plot(stockDataStore.wkHiLoChartIndex)
              .getSeries(i)
              .name();
            if (seriesNames.includes(seriesName)) {
              ////console.log(seriesName);
              chart.current
                .plot(stockDataStore.wkHiLoChartIndex)
                .getSeries(i)
                .data(seriesMapping[seriesName]);
            }
          }
        }
      }

      let controller = chart.current
        .plot(stockDataStore.wkHiLoChartIndex)
        .annotations();

      for (let j = 0; j < WkHiLoRangeblineData.length; j++) {
        if (!WkHiLoRangeblineData[j][1]) continue;
        annotationIndex.WkHiLoRangeannotationIndex.push(
          controller.marker({
            xAnchor: WkHiLoRangeblineData[j][0],
            valueAnchor: WkHiLoRangeblineData[j][1],
            markerType: "arrow-up",
            fill: "#800020",
            stroke: "#800020",
            size: 15,
          })
        );
      }
      for (let j = 0; j < WkHiLoRangeslineData.length; j++) {
        if (!WkHiLoRangeslineData[j][1]) continue;
        annotationIndex.WkHiLoRangeannotationIndex.push(
          controller.marker({
            xAnchor: WkHiLoRangeslineData[j][0],
            valueAnchor: WkHiLoRangeslineData[j][1],
            markerType: "arrowDown",
            fill: "#087830",
            stroke: "#087830",
            size: 15,
          })
        );
      }
      chart.current.plot(stockDataStore.wkHiLoChartIndex).yScale().minimum(-30);
    }
  },
  async addVIXTopBottom(
    chart,
    interval,
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
    const VIXTopBottomresult = await indicatorApi.calculateVIXTopBottom({
      ...apiInputParam,
      ticker,
      interval,
      adjustDividend,
      startDate: realStartTime,
      endDate: realEndTime,
    });

    if (VIXTopBottomresult) {
      let VIXTopBottomwvfData = VIXTopBottomresult.map((p, idx) => {
        return [moment(p.date).valueOf(), p.wvf];
      });
      let VIXTopBottomwvfrData = VIXTopBottomresult.map((p, idx) => {
        return [moment(p.date).valueOf(), p.wvfr];
      });
      let VIXTopBottombotpoleData = VIXTopBottomresult.map((p, idx) => {
        return [moment(p.date).valueOf(), p.botpole];
      });
      let VIXTopBottomtoppleData = VIXTopBottomresult.map((p, idx) => {
        return [moment(p.date).valueOf(), p.topple];
      });
      let VIXTopBottomhvData = VIXTopBottomresult.map((p, idx) => {
        return [moment(p.date).valueOf(), p.hv];
      });

      var VIXTopBottomwvfTable = anychart.data.table();
      VIXTopBottomwvfTable.addData(VIXTopBottomwvfData);
      var VIXTopBottomwvfMapping = VIXTopBottomwvfTable.mapAs();
      VIXTopBottomwvfMapping.addField("value", 1);

      var VIXTopBottomwvfrTable = anychart.data.table();
      VIXTopBottomwvfrTable.addData(VIXTopBottomwvfrData);
      var VIXTopBottomwvfrMapping = VIXTopBottomwvfrTable.mapAs();
      VIXTopBottomwvfrMapping.addField("value", 1);

      var VIXTopBottomhvTable = anychart.data.table();
      VIXTopBottomhvTable.addData(VIXTopBottomhvData);
      var VIXTopBottomhvMapping = VIXTopBottomhvTable.mapAs();
      VIXTopBottomhvMapping.addField("value", 1);

      if (!update) {
        if (
          stockTool.parameters.find((p) => p.name === "show1").value ===
          "Bottom"
        ) {
          chart.current
            .plot(plotIndex.current + 1)
            .column(VIXTopBottomwvfMapping)
            .name("wvf")
            .fill(function () {
              if (!this.value) return this.sourceColor;
              if (!this.x) return this.sourceColor;
              let resultIndex = VIXTopBottomwvfData.findIndex(
                (p) => this.value === p[1]
              );
              if (resultIndex < 0) {
                return this.sourceColor;
              }
              if (!VIXTopBottomwvfData[resultIndex]) return;
              if (
                VIXTopBottomwvfData[resultIndex][1] >=
                VIXTopBottombotpoleData[resultIndex][1]
              ) {
                return "rgb(245, 134, 107)";
              } else {
                return "rgb(140, 232, 242)";
              }
            });
        } else {
          chart.current
            .plot(plotIndex.current + 1)
            .column(VIXTopBottomwvfrMapping)
            .name("wvfr")
            .fill(function () {
              if (!this.value) return this.sourceColor;
              if (!this.x) return this.sourceColor;
              let resultIndex = VIXTopBottomwvfrData.findIndex(
                (p) => this.value === p[1]
              );
              if (resultIndex < 0) {
                return this.sourceColor;
              }
              if (!VIXTopBottomwvfrData[resultIndex - 1]) return;
              if (
                VIXTopBottomwvfrData[resultIndex][1] >=
                VIXTopBottomtoppleData[resultIndex][1]
              ) {
                return "rgb(203, 102, 220)";
              } else {
                return "rgb(186, 231, 138)";
              }
            });
        }
        if (stockTool.parameters.find((p) => p.name === "showHV").value) {
          chart.current
            .plot(plotIndex.current + 1)
            .line(VIXTopBottomhvMapping)
            .name("Historical Volatility")
            .stroke("rgb(255, 152, 0)");
        }
        stockDataStore.VIXTopBottomChartIndex = plotIndex.current + 1;
        plotIndex.current += 1;
      } else {
        let seriesNames = ["wvf", "wvfr", "Historical Volatility"];
        let wvfExist = false;
        let wvfrExist = false;
        let seriesMapping = {
          wvf: VIXTopBottomwvfMapping,
          wvfr: VIXTopBottomwvfrMapping,
          "Historical Volatility": VIXTopBottomhvMapping,
        };
        let seriesLength = chart.current
          .plot(stockDataStore.VIXTopBottomChartIndex)
          .getSeriesCount();
        for (let i = seriesLength - 1 + 100; i > -1; i--) {
          if (
            chart.current
              .plot(stockDataStore.VIXTopBottomChartIndex)
              .getSeries(i)
          ) {
            let seriesName = chart.current
              .plot(stockDataStore.VIXTopBottomChartIndex)
              .getSeries(i)
              .name();
            if (seriesNames.includes(seriesName)) {
              if (seriesName === "wvf") wvfExist = true;
              if (seriesName === "wvfr") wvfrExist = true;
              if (
                stockTool.parameters.find((p) => p.name === "show1").value ===
                  "Bottom" &&
                seriesName === "wvfr"
              ) {
                chart.current
                  .plot(stockDataStore.VIXTopBottomChartIndex)
                  .removeSeries(i);
              } else if (
                stockTool.parameters.find((p) => p.name === "show1").value ===
                  "Top" &&
                seriesName === "wvf"
              ) {
                chart.current
                  .plot(stockDataStore.VIXTopBottomChartIndex)
                  .removeSeries(i);
              } else {
                let seriesDraw = chart.current
                  .plot(stockDataStore.VIXTopBottomChartIndex)
                  .getSeries(i)
                  .data(seriesMapping[seriesName]);

                if (
                  stockTool.parameters.find((p) => p.name === "show1").value ===
                    "Bottom" &&
                  seriesName === "wvf"
                ) {
                  seriesDraw.fill(function () {
                    if (!this.value) return this.sourceColor;
                    if (!this.x) return this.sourceColor;
                    let resultIndex = VIXTopBottomwvfData.findIndex(
                      (p) => this.value === p[1]
                    );
                    if (resultIndex < 0) {
                      return this.sourceColor;
                    }
                    if (!VIXTopBottomwvfData[resultIndex]) return;
                    if (
                      VIXTopBottomwvfData[resultIndex][1] >=
                      VIXTopBottombotpoleData[resultIndex][1]
                    ) {
                      return "rgb(245, 134, 107)";
                    } else {
                      return "rgb(140, 232, 242)";
                    }
                  });
                }
                if (
                  stockTool.parameters.find((p) => p.name === "show1").value ===
                    "Top" &&
                  seriesName === "wvfr"
                ) {
                  seriesDraw.fill(function () {
                    if (!this.value) return this.sourceColor;
                    if (!this.x) return this.sourceColor;
                    let resultIndex = VIXTopBottomwvfrData.findIndex(
                      (p) => this.value === p[1]
                    );
                    if (resultIndex < 0) {
                      return this.sourceColor;
                    }
                    if (!VIXTopBottomwvfrData[resultIndex]) return;
                    if (
                      VIXTopBottomwvfrData[resultIndex][1] >=
                      VIXTopBottomtoppleData[resultIndex][1]
                    ) {
                      return "rgb(203, 102, 220)";
                    } else {
                      return "rgb(186, 231, 138)";
                    }
                  });
                }
              }
            }
          }
        }
        if (
          stockTool.parameters.find((p) => p.name === "show1").value ===
            "Bottom" &&
          !wvfExist
        ) {
          chart.current
            .plot(stockDataStore.VIXTopBottomChartIndex)
            .column(VIXTopBottomwvfMapping)
            .name("wvf")
            .fill(function () {
              if (!this.value) return this.sourceColor;
              if (!this.x) return this.sourceColor;
              let resultIndex = VIXTopBottomwvfData.findIndex(
                (p) => this.value === p[1]
              );
              if (resultIndex < 0) {
                return this.sourceColor;
              }
              if (!VIXTopBottomwvfData[resultIndex]) return;
              if (
                VIXTopBottomwvfData[resultIndex][1] >=
                VIXTopBottombotpoleData[resultIndex][1]
              ) {
                return "rgb(245, 134, 107)";
              } else {
                return "rgb(140, 232, 242)";
              }
            });
        }
        if (
          stockTool.parameters.find((p) => p.name === "show1").value ===
            "Top" &&
          !wvfrExist
        ) {
          chart.current
            .plot(stockDataStore.VIXTopBottomChartIndex)
            .column(VIXTopBottomwvfrMapping)
            .name("wvfr")
            .fill(function () {
              if (!this.value) return this.sourceColor;
              if (!this.x) return this.sourceColor;
              let resultIndex = VIXTopBottomwvfrData.findIndex(
                (p) => this.value === p[1]
              );
              if (resultIndex < 0) {
                return this.sourceColor;
              }
              if (!VIXTopBottomwvfrData[resultIndex]) return;
              if (
                VIXTopBottomwvfrData[resultIndex][1] >=
                VIXTopBottomtoppleData[resultIndex][1]
              ) {
                return "rgb(203, 102, 220)";
              } else {
                return "rgb(186, 231, 138)";
              }
            });
        }
      }
    }
  },
  async addKO(
    chart,
    interval,
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
    const KOresult = await indicatorApi.calculateKO({
      ...apiInputParam,
      ticker,
      interval,
      adjustDividend,
      startDate: realStartTime,
      endDate: realEndTime,
    });

    if (KOresult) {
      let Ko1Data = KOresult.map((p) => {
        return [moment(p.date).valueOf(), p.ko1];
      });
      let Ko2Data = KOresult.map((p) => {
        return [moment(p.date).valueOf(), p.ko2];
      });
      let Ko3Data = KOresult.map((p) => {
        return [moment(p.date).valueOf(), p.ko3];
      });

      var Ko1Table = anychart.data.table();
      Ko1Table.addData(Ko1Data);
      var Ko1Mapping = Ko1Table.mapAs();
      Ko1Mapping.addField("value", 1);

      var Ko2Table = anychart.data.table();
      Ko2Table.addData(Ko2Data);
      var Ko2Mapping = Ko2Table.mapAs();
      Ko2Mapping.addField("value", 1);

      var Ko3Table = anychart.data.table();
      Ko3Table.addData(Ko3Data);
      var Ko3Mapping = Ko3Table.mapAs();
      Ko3Mapping.addField("value", 1);

      if (!update) {
        chart.current
          .plot(plotIndex.current + 1)
          .line(Ko1Mapping)
          .stroke("rgb(33, 150, 243)")
          .name("KO1");
        chart.current
          .plot(plotIndex.current + 1)
          .line(Ko2Mapping)
          .stroke("rgb(255, 152, 0)")
          .name("KO2");
        chart.current
          .plot(plotIndex.current + 1)
          .line(Ko3Mapping)
          .stroke("rgb(178, 181, 190)")
          .name("KO3");

        stockDataStore.kochartIndex = plotIndex.current + 1;
        plotIndex.current += 1;
      } else {
        let seriesNames = ["KO1", "KO2", "KO3"];
        let seriesMapping = {
          KO1: Ko1Mapping,
          KO2: Ko2Mapping,
          KO3: Ko3Mapping,
        };
        let seriesLength = chart.current
          .plot(stockDataStore.kochartIndex)
          .getSeriesCount();
        for (let i = seriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(stockDataStore.kochartIndex).getSeries(i)) {
            let seriesName = chart.current
              .plot(stockDataStore.kochartIndex)
              .getSeries(i)
              .name();
            if (seriesNames.includes(seriesName)) {
              ////console.log(seriesName);
              chart.current
                .plot(stockDataStore.kochartIndex)
                .getSeries(i)
                .data(seriesMapping[seriesName]);
            }
          }
        }
      }
    }
  },
  async addLinearRegression(
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
    const LinearRegressionresult = await indicatorApi.calculateLinearRegression(
      {
        ...apiInputParam,
        ticker,
        interval,
        adjustDividend,
        startDate: realStartTime,
        endDate: realEndTime,
      }
    );

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
              chart.current
                .plot(0)
                .getSeries(i)
                .data(seriesMapping[seriesName]);
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
      // ////console.log(chart.current.plot(0).yScale().maximum());
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
      // ////console.log(max);
    }
  },
  async addZigZag(
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
      let ZigzagMedianData = Zigzagresult.filter(
        (p) => p.medianChannelLine
      ).map((p) => {
        return [moment(p.date).valueOf(), p.medianChannelLine];
      });
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
  },
  async addIntraATR(
    chart,
    interval,
    stockTool,
    ticker,
    adjustDividend,
    realStartTime,
    realEndTime,
    plotIndex,
    update = false
  ) {
    var controller = chart.current.plot(0).annotations();
    let textC = "rgb(76, 175, 80)";
    let apiInputParam = {};
    stockTool.parameters.forEach((opt) => {
      apiInputParam[opt.name] =
        Number.isNaN(+opt.value) || typeof opt.value == "boolean"
          ? opt.value
          : +opt.value;
    });
    const IntraATRresult = await indicatorApi.calculateIntraATR({
      ...apiInputParam,
      ticker,
      interval,
      adjustDividend,
      startDate: realStartTime,
      endDate: realEndTime,
    });

    if (IntraATRresult) {
      let IntraATRftopData = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.ftop];
      });
      let IntraATRfbotData = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.fbot];
      });
      let IntraATRfmidData = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.fmid];
      });
      let IntraATRf10Data = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.f10];
      });
      let IntraATRf20Data = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.f20];
      });
      let IntraATRf30Data = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.f30];
      });
      let IntraATRf40Data = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.f40];
      });
      let IntraATRf60Data = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.f60];
      });
      let IntraATRf70Data = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.f70];
      });
      let IntraATRf80Data = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.f80];
      });
      let IntraATRf90Data = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.f90];
      });
      let IntraATRData = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.atr];
      });
      let IntraTRData = IntraATRresult.map((p) => {
        return [moment(p.date).valueOf(), p.tr];
      });

      var IntraATRftopTable = anychart.data.table();
      IntraATRftopTable.addData(IntraATRftopData);
      var IntraATRftopMapping = IntraATRftopTable.mapAs();
      IntraATRftopMapping.addField("value", 1);

      var IntraATRfbotTable = anychart.data.table();
      IntraATRfbotTable.addData(IntraATRfbotData);
      var IntraATRfbotMapping = IntraATRfbotTable.mapAs();
      IntraATRfbotMapping.addField("value", 1);

      var IntraATRfmidTable = anychart.data.table();
      IntraATRfmidTable.addData(IntraATRfmidData);
      var IntraATRfmidMapping = IntraATRfmidTable.mapAs();
      IntraATRfmidMapping.addField("value", 1);

      var IntraATRf10Table = anychart.data.table();
      IntraATRf10Table.addData(IntraATRf10Data);
      var IntraATRf10Mapping = IntraATRf10Table.mapAs();
      IntraATRf10Mapping.addField("value", 1);

      var IntraATRf20Table = anychart.data.table();
      IntraATRf20Table.addData(IntraATRf20Data);
      var IntraATRf20Mapping = IntraATRf20Table.mapAs();
      IntraATRf20Mapping.addField("value", 1);

      var IntraATRf30Table = anychart.data.table();
      IntraATRf30Table.addData(IntraATRf30Data);
      var IntraATRf30Mapping = IntraATRf30Table.mapAs();
      IntraATRf30Mapping.addField("value", 1);

      var IntraATRf40Table = anychart.data.table();
      IntraATRf40Table.addData(IntraATRf40Data);
      var IntraATRf40Mapping = IntraATRf40Table.mapAs();
      IntraATRf40Mapping.addField("value", 1);

      var IntraATRf60Table = anychart.data.table();
      IntraATRf60Table.addData(IntraATRf60Data);
      var IntraATRf60Mapping = IntraATRf60Table.mapAs();
      IntraATRf60Mapping.addField("value", 1);

      var IntraATRf70Table = anychart.data.table();
      IntraATRf70Table.addData(IntraATRf70Data);
      var IntraATRf70Mapping = IntraATRf70Table.mapAs();
      IntraATRf70Mapping.addField("value", 1);

      var IntraATRf80Table = anychart.data.table();
      IntraATRf80Table.addData(IntraATRf80Data);
      var IntraATRf80Mapping = IntraATRf80Table.mapAs();
      IntraATRf80Mapping.addField("value", 1);

      var IntraATRf90Table = anychart.data.table();
      IntraATRf90Table.addData(IntraATRf90Data);
      var IntraATRf90Mapping = IntraATRf90Table.mapAs();
      IntraATRf90Mapping.addField("value", 1);

      let color1 = "#00bcd4";
      let color2 = "#b2b5be";

      if (!update) {
        chart.current
          .plot(plotIndex.current)
          .line(IntraATRftopData)
          .stroke("rgb(255, 152, 0)")
          .name("ftop");

        chart.current
          .plot(plotIndex.current)
          .line(IntraATRfbotData)
          .stroke("rgb(76, 175, 80)")
          .name("fbot");

        chart.current
          .plot(plotIndex.current)
          .line(IntraATRfmidData)
          .stroke("rgb(255, 235, 59)")
          .name("fmid");

        chart.current
          .plot(plotIndex.current)
          .line(IntraATRf10Data)
          .stroke(color2)
          .name("f10");

        chart.current
          .plot(plotIndex.current)
          .line(IntraATRf20Data)
          .stroke(color2)
          .name("f20");

        chart.current
          .plot(plotIndex.current)
          .line(IntraATRf30Data)
          .stroke(color2)
          .name("f30");

        chart.current
          .plot(plotIndex.current)
          .line(IntraATRf40Data)
          .stroke(color2)
          .name("f40");

        chart.current
          .plot(plotIndex.current)
          .line(IntraATRf60Data)
          .stroke(color1)
          .name("f60");

        chart.current
          .plot(plotIndex.current)
          .line(IntraATRf70Data)
          .stroke(color1)
          .name("f70");

        chart.current
          .plot(plotIndex.current)
          .line(IntraATRf80Data)
          .stroke(color1)
          .name("f80");

        chart.current
          .plot(plotIndex.current)
          .line(IntraATRf90Data)
          .stroke(color1)
          .name("f90");
      } else {
        let seriesNames = [
          "ftop",
          "fbot",
          "fmid",
          "f10",
          "f20",
          "f30",
          "f40",
          "f60",
          "f70",
          "f80",
          "f90",
        ];
        let seriesMapping = {
          ftop: IntraATRftopMapping,
          fmid: IntraATRfmidMapping,
          fbot: IntraATRfbotMapping,
          f10: IntraATRf10Mapping,
          f20: IntraATRf20Mapping,
          f30: IntraATRf30Mapping,
          f40: IntraATRf40Mapping,
          f60: IntraATRf60Mapping,
          f70: IntraATRf70Mapping,
          f80: IntraATRf80Mapping,
          f90: IntraATRf90Mapping,
        };
        let seriesLength = chart.current
          .plot(plotIndex.current)
          .getSeriesCount();

        for (let i = seriesLength - 1 + 100; i > -1; i--) {
          if (chart.current.plot(plotIndex.current).getSeries(i)) {
            let seriesName = chart.current
              .plot(plotIndex.current)
              .getSeries(i)
              .name();
            if (seriesNames.includes(seriesName)) {
              ////console.log(seriesName);
              chart.current
                .plot(plotIndex.current)
                .getSeries(i)
                .data(seriesMapping[seriesName]);
            }
          }
        }
      }

      var bb1 = controller.label({
        xAnchor: moment(IntraATRfbotData[IntraATRfbotData.length - 1][0])
          .add(2, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRfbotData[IntraATRfbotData.length - 1][1],
        text: " 0",
        normal: { fontColor: textC },
      });
      bb1.background(false);
      bb1.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(bb1);
      var bb2 = controller.label({
        xAnchor: moment(IntraATRf10Data[IntraATRf10Data.length - 1][0])
          .add(2, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRf10Data[IntraATRf10Data.length - 1][1],
        text: " 10",
        normal: { fontColor: textC },
      });
      bb2.background(false);
      bb2.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(bb2);
      var bb3 = controller.label({
        xAnchor: moment(IntraATRf20Data[IntraATRf20Data.length - 1][0])
          .add(2, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRf20Data[IntraATRf20Data.length - 1][1],
        text: " 20",
        normal: { fontColor: textC },
      });
      bb3.background(false);
      bb3.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(bb3);
      var bb4 = controller.label({
        xAnchor: moment(IntraATRf30Data[IntraATRf30Data.length - 1][0])
          .add(2, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRf30Data[IntraATRf30Data.length - 1][1],
        text: " 30",
        normal: { fontColor: textC },
      });
      bb4.background(false);
      bb4.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(bb4);
      var bb5 = controller.label({
        xAnchor: moment(IntraATRf40Data[IntraATRf40Data.length - 1][0])
          .add(2, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRf40Data[IntraATRf40Data.length - 1][1],
        text: " 40",
        normal: { fontColor: textC },
      });
      bb5.background(false);
      bb5.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(bb5);
      var bb6 = controller.label({
        xAnchor: moment(IntraATRfmidData[IntraATRfmidData.length - 1][0])
          .add(2, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRfmidData[IntraATRfmidData.length - 1][1],
        text: " 50",
        normal: { fontColor: textC },
      });
      bb6.background(false);
      bb6.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(bb6);
      var bb7 = controller.label({
        xAnchor: moment(IntraATRf60Data[IntraATRf60Data.length - 1][0])
          .add(2, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRf60Data[IntraATRf60Data.length - 1][1],
        text: " 60",
        normal: { fontColor: textC },
      });
      bb7.background(false);
      bb7.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(bb7);
      var bb8 = controller.label({
        xAnchor: moment(IntraATRf70Data[IntraATRf70Data.length - 1][0])
          .add(2, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRf70Data[IntraATRf70Data.length - 1][1],
        text: " 70",
        normal: { fontColor: textC },
      });
      bb8.background(false);
      bb8.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(bb8);
      var bb9 = controller.label({
        xAnchor: moment(IntraATRf80Data[IntraATRf80Data.length - 1][0])
          .add(2, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRf80Data[IntraATRf80Data.length - 1][1],
        text: " 80",
        normal: { fontColor: textC },
      });
      bb9.background(false);
      bb9.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(bb9);
      var bb10 = controller.label({
        xAnchor: moment(IntraATRf90Data[IntraATRf90Data.length - 1][0])
          .add(2, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRf90Data[IntraATRf90Data.length - 1][1],
        text: " 90",
        normal: { fontColor: textC },
      });
      bb10.background(false);
      bb10.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(bb10);
      var bb11 = controller.label({
        xAnchor: moment(IntraATRftopData[IntraATRftopData.length - 1][0])
          .add(2, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRftopData[IntraATRftopData.length - 1][1],
        text: " 100",
        normal: { fontColor: textC },
      });
      bb11.background(false);
      bb11.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(bb11);

      let trpct =
        (100 * IntraTRData[IntraTRData.length - 1][1]) /
        IntraATRData[IntraATRData.length - 1][1];
      trpct = trpct.toFixed(2);

      var trstr = controller.label({
        xAnchor: moment(IntraTRData[IntraTRData.length - 1][0])
          .subtract(60, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRftopData[IntraATRftopData.length - 1][1],
        text:
          trpct + "% TR" + IntraTRData[IntraTRData.length - 1][1].toFixed(2),
        normal: { fontColor: textC },
      });
      trstr.background(false);
      trstr.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(trstr);
      var atrstr = controller.label({
        xAnchor: moment(IntraATRData[IntraATRData.length - 1][0])
          .subtract(60, intervalTimeUnit(interval))
          .valueOf(),
        valueAnchor: IntraATRfbotData[IntraATRfbotData.length - 1][1],
        text: "ATR " + IntraATRData[IntraATRData.length - 1][1].toFixed(2),
        normal: { fontColor: textC },
      });
      atrstr.background(false);
      atrstr.allowEdit(false);
      annotationIndex.IntraATRannotationIndex.push(atrstr);

      let range = chart.current.getSelectedRange();
      let visibleftopData = IntraATRftopData.filter((p) => {
        return range.firstSelected <= p[0] && range.lastSelected >= p[0];
      }).map((r) => r[1]);
      let visiblefbotData = IntraATRfbotData.filter((p) => {
        return range.firstSelected <= p[0] && range.lastSelected >= p[0];
      }).map((r) => r[1]);

      stockDataStore.IntraATRMax = Math.max(...visibleftopData);
      stockDataStore.IntraATRMin = Math.min(...visiblefbotData) * 0.98;

      chart.current
        .plot(0)
        .yScale()
        .maximum(stockDataStore.IntraATRMax.toFixed(2));
      chart.current
        .plot(0)
        .yScale()
        .minimum(stockDataStore.IntraATRMin.toFixed(2));
    }
  },
  async addIntraFline(
    chart,
    interval,
    stockData,
    stockTool,
    ticker,
    adjustDividend,
    realStartTime,
    realEndTime,
    currentTradingPeriod,
    update = false
  ) {
    let apiInputParam = {};
    stockTool.parameters.forEach((opt) => {
      apiInputParam[opt.name] =
        Number.isNaN(+opt.value) || typeof opt.value == "boolean"
          ? opt.value
          : +opt.value;
    });
    const IntraHiLoFiboresult = await indicatorApi.calculateIntraFiboPivotHiLo({
      ...apiInputParam,
      ticker,
      interval,
      adjustDividend,
      startDate: realStartTime,
      endDate: realEndTime,
      currentTradingPeriod,
    });

    if (IntraHiLoFiboresult) {
      ////console.log(IntraHiLoFiboresult);
      let IntraHiLoFibopvhData = IntraHiLoFiboresult.map((p) => {
        return [moment(p.date).valueOf(), p.pvh];
      });
      let IntraHiLoFibopvlData = IntraHiLoFiboresult.map((p) => {
        return [moment(p.date).valueOf(), p.pvl];
      });
      let IntraHiLoFibohighData = IntraHiLoFiboresult.map((p) => {
        return [moment(p.date).valueOf(), p.high, p.pvh];
      });
      let IntraHiLoFibolowData = IntraHiLoFiboresult.map((p) => {
        return [moment(p.date).valueOf(), p.low, p.pvl];
      });
      let mode = stockTool.parameters.find((p) => p.name === "mode");

      let sup = +stockTool.parameters.find(
        (p) => p.name === "Extend upward fibo?"
      );

      let sdn = +stockTool.parameters.find(
        (p) => p.name === "Extend upward fibo?"
      );

      let dd = IntraHiLoFibopvhData[0][1] - IntraHiLoFibopvlData[0][1];
      let b0 = IntraHiLoFibopvlData[0][1];
      let startTime = IntraHiLoFibopvhData[0][0];
      let endTime = IntraHiLoFibopvhData[IntraHiLoFibopvhData.length - 1][0];

      var controller = chart.plot(0).annotations();

      var line = controller.line({
        xAnchor: moment(startTime).valueOf(),
        valueAnchor: b0,
        secondXAnchor: moment(endTime).valueOf(),
        secondValueAnchor: b0,
        normal: { stroke: "rgb(0,230,118)" },
      });

      var label = controller.label({
        xAnchor: moment(endTime).valueOf(),
        valueAnchor: b0,
        text: "0" + " ( " + b0.toFixed(2) + " ) ",
        normal: { fontColor: "rgb(41, 98, 255)" },
      });
      label
        .background({
          fill: "rgb(255, 255, 255)",
          stroke: "rgb(255, 255, 255)",
        })
        .offsetY(-15)
        .fontSize(10);

      // chart
      //   .plot(0)
      //   .yScale()
      //   .minimum(Math.min(...[b0 * 0.99, this.globalMin]).toFixed(2));
      var line2 = controller.line({
        xAnchor: startTime,
        valueAnchor: b0 + dd * 0.236,
        secondXAnchor: endTime,
        secondValueAnchor: b0 + dd * 0.236,
        normal: { stroke: "rgb(120,123,134)" },
      });
      var label2 = controller.label({
        xAnchor: moment(endTime).valueOf(),
        valueAnchor: b0 + dd * 0.236,
        text: "0.236" + " ( " + (b0 + dd * 0.236).toFixed(2) + " ) ",
        normal: { fontColor: "rgb(41, 98, 255)" },
      });
      label2
        .background({
          fill: "rgb(255, 255, 255)",
          stroke: "rgb(255, 255, 255)",
        })
        .offsetY(-15)
        .fontSize(10);
      var line3 = controller.line({
        xAnchor: startTime,
        valueAnchor: b0 + dd * 0.382,
        secondXAnchor: endTime,
        secondValueAnchor: b0 + dd * 0.382,
        normal: { stroke: "rgb(128,128,0)" },
      });
      var label3 = controller.label({
        xAnchor: moment(endTime).valueOf(),
        valueAnchor: b0 + dd * 0.382,
        text: "0.382" + " ( " + (b0 + dd * 0.382).toFixed(2) + " ) ",
        normal: { fontColor: "rgb(41, 98, 255)" },
      });
      label3
        .background({
          fill: "rgb(255, 255, 255)",
          stroke: "rgb(255, 255, 255)",
        })
        .offsetY(-15)
        .fontSize(10);
      var line5 = controller.line({
        xAnchor: startTime,
        valueAnchor: b0 + dd * 0.5,
        secondXAnchor: endTime,
        secondValueAnchor: b0 + dd * 0.5,
        normal: { stroke: "rgb(224,64,251)" },
      });
      var label5 = controller.label({
        xAnchor: moment(endTime).valueOf(),
        valueAnchor: b0 + dd * 0.5,
        text: "0.5" + " ( " + (b0 + dd * 0.5).toFixed(2) + " ) ",
        normal: { fontColor: "rgb(41, 98, 255)" },
      });
      label5
        .background({
          fill: "rgb(255, 255, 255)",
          stroke: "rgb(255, 255, 255)",
        })
        .offsetY(-15)
        .fontSize(10);
      var line6 = controller.line({
        xAnchor: startTime,
        valueAnchor: b0 + dd * 0.618,
        secondXAnchor: endTime,
        secondValueAnchor: b0 + dd * 0.618,
        normal: { stroke: "rgb(128,128,0)" },
      });
      var label6 = controller.label({
        xAnchor: moment(endTime).valueOf(),
        valueAnchor: b0 + dd * 0.618,
        text: "0.618" + " ( " + (b0 + dd * 0.618).toFixed(2) + " ) ",
        normal: { fontColor: "rgb(41, 98, 255)" },
      });
      label6
        .background({
          fill: "rgb(255, 255, 255)",
          stroke: "rgb(255, 255, 255)",
        })
        .offsetY(-15)
        .fontSize(10);
      var line7 = controller.line({
        xAnchor: startTime,
        valueAnchor: b0 + dd * 0.786,
        secondXAnchor: endTime,
        secondValueAnchor: b0 + dd * 0.786,
        normal: { stroke: "rgb(120,123,134)" },
      });
      var label7 = controller.label({
        xAnchor: moment(endTime).valueOf(),
        valueAnchor: b0 + dd * 0.786,
        text: "0.786" + " ( " + (b0 + dd * 0.786).toFixed(2) + " ) ",
        normal: { fontColor: "rgb(41, 98, 255)" },
      });
      label7
        .background({
          fill: "rgb(255, 255, 255)",
          stroke: "rgb(255, 255, 255)",
        })
        .offsetY(-15)
        .fontSize(10);
      var line1 = controller.line({
        xAnchor: startTime,
        valueAnchor: b0 + dd,
        secondXAnchor: endTime,
        secondValueAnchor: b0 + dd,
        normal: { stroke: "rgb(255,82,82)" },
      });
      // this.chart
      //     .plot(0)
      //     .yScale()
      //     .maximum(Math.max(...[(b0 + dd) * 1.005, this.globalMax]).toFixed(2));
      var label1 = controller.label({
        xAnchor: moment(endTime).valueOf(),
        valueAnchor: b0 + dd,
        text: "1" + " ( " + (b0 + dd).toFixed(2) + " ) ",
        normal: { fontColor: "rgb(41, 98, 255)" },
      });
      label1
        .background({
          fill: "rgb(255, 255, 255)",
          stroke: "rgb(255, 255, 255)",
        })
        .offsetY(-15)
        .fontSize(10);
      if (mode == "Observation") {
        IntraHiLoFibohighData.forEach((p) => {
          if (p[1]) {
            ////console.log(p);
            let labelHi = controller.label({
              xAnchor: moment(p[0]),
              valueAnchor: p[2],
              text: "Hi",
              normal: { fontColor: "rgb(255,82,82)" },
            });

            labelHi
              .background({
                fill: "rgb(255, 255, 255)",
                stroke: "rgb(255, 255, 255)",
              })
              .offsetY(-25);
            annotationIndex.push(labelHi);
          }
        });
        IntraHiLoFibolowData.forEach((p) => {
          if (p[1]) {
            ////console.log(p);
            let labelLo = controller.label({
              xAnchor: moment(p[0]),
              valueAnchor: p[2],
              text: "Lo",
              normal: { fontColor: "rgb(33,150,243)" },
            });

            labelLo
              .background({
                fill: "rgb(255, 255, 255)",
                stroke: "rgb(255, 255, 255)",
              })
              .offsetY(5);
            annotationIndex.push(labelLo);
          }
        });
      }

      annotationIndex.IntraFlineannotationIndex.push(line);
      annotationIndex.IntraFlineannotationIndex.push(line2);
      annotationIndex.IntraFlineannotationIndex.push(line3);
      annotationIndex.IntraFlineannotationIndex.push(line5);
      annotationIndex.IntraFlineannotationIndex.push(line6);
      annotationIndex.IntraFlineannotationIndex.push(line7);
      annotationIndex.IntraFlineannotationIndex.push(line1);
      annotationIndex.IntraFlineannotationIndex.push(label);
      annotationIndex.IntraFlineannotationIndex.push(label2);
      annotationIndex.IntraFlineannotationIndex.push(label3);
      annotationIndex.IntraFlineannotationIndex.push(label5);
      annotationIndex.IntraFlineannotationIndex.push(label6);
      annotationIndex.IntraFlineannotationIndex.push(label7);
      annotationIndex.IntraFlineannotationIndex.push(label1);

      if (sup === 1 || sup === 2) {
        var line12 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 1.236,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 1.236,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var label12 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 1.236,
          text: "0.236" + " ( " + (b0 + dd * 1.236).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label12
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var line13 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 1.382,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 1.382,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var label13 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 1.382,
          text: "0.382" + " ( " + (b0 + dd * 1.382).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label13
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var line15 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 1.5,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 1.5,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var label15 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 1.5,
          text: "0.5" + " ( " + (b0 + dd * 1.5).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label15
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var line16 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 1.618,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 1.618,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var label16 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 1.618,
          text: "0.618" + " ( " + (b0 + dd * 1.618).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label16
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var line17 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 1.786,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 1.786,
          normal: { stroke: "rgb(120,123,134)" },
        });

        var label17 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 1.786,
          text: "0.786" + " ( " + (b0 + dd * 1.786).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label17
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var line11 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 2,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 2,
          normal: { stroke: "rgb(120,123,134)" },
        });
        // this.chart
        //   .plot(0)
        //   .yScale()
        //   .maximum(
        //     Math.max(...[(b0 + dd * 2) * 1.005, this.globalMax]).toFixed(2)
        //   );
        var label11 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 2,
          text: "1" + " ( " + (b0 + dd * 2).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label11
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        annotationIndex.IntraFlineannotationIndex.push(line12);
        annotationIndex.IntraFlineannotationIndex.push(line13);
        annotationIndex.IntraFlineannotationIndex.push(line15);
        annotationIndex.IntraFlineannotationIndex.push(line16);
        annotationIndex.IntraFlineannotationIndex.push(line17);
        annotationIndex.IntraFlineannotationIndex.push(line11);
        annotationIndex.IntraFlineannotationIndex.push(label12);
        annotationIndex.IntraFlineannotationIndex.push(label13);
        annotationIndex.IntraFlineannotationIndex.push(label15);
        annotationIndex.IntraFlineannotationIndex.push(label16);
        annotationIndex.IntraFlineannotationIndex.push(label17);
        annotationIndex.IntraFlineannotationIndex.push(label11);
      }
      if (sup == 2) {
        var line22 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 2.236,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 2.236,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var label22 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 2.236,
          text: "0.236" + " ( " + (b0 + dd * 2.236).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label22
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var line23 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 2.382,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 2.382,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var label23 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 2.382,
          text: "0.3832" + " ( " + (b0 + dd * 2.382).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label23
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var line25 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 2.5,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 2.5,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var label25 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 2.5,
          text: "0.5" + " ( " + (b0 + dd * 2.5).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label25
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var line26 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 2.618,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 2.618,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var label26 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 2.618,
          text: "0.618" + " ( " + (b0 + dd * 2.618).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label26
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var line27 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 2.786,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 2.786,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var label27 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 2.786,
          text: "0.786" + " ( " + (b0 + dd * 2.786).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label27
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var line21 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 + dd * 3,
          secondXAnchor: endTime,
          secondValueAnchor: b0 + dd * 3,
          normal: { stroke: "rgb(120,123,134)" },
        });
        // this.chart
        //   .plot(0)
        //   .yScale()
        //   .maximum(
        //     Math.max(...[(b0 + dd * 3) * 1.005, this.globalMax]).toFixed(2)
        //   );
        var label21 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 + dd * 3,
          text: "1" + " ( " + (b0 + dd * 3).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        label21
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        annotationIndex.IntraFlineannotationIndex.push(line22);
        annotationIndex.IntraFlineannotationIndex.push(line23);
        annotationIndex.IntraFlineannotationIndex.push(line25);
        annotationIndex.IntraFlineannotationIndex.push(line26);
        annotationIndex.IntraFlineannotationIndex.push(line27);
        annotationIndex.IntraFlineannotationIndex.push(line21);
        annotationIndex.IntraFlineannotationIndex.push(label22);
        annotationIndex.IntraFlineannotationIndex.push(label23);
        annotationIndex.IntraFlineannotationIndex.push(label25);
        annotationIndex.IntraFlineannotationIndex.push(label26);
        annotationIndex.IntraFlineannotationIndex.push(label27);
        annotationIndex.IntraFlineannotationIndex.push(label21);
      }
      if (sdn == 1 || sdn == 2) {
        var linea2 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd * 0.236,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd * 0.236,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var labela2 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 - dd * 0.236,
          text: "0.236" + " ( " + (b0 - dd * 0.236).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        labela2
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var linea3 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd * 0.382,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd * 0.382,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var labela3 = controller
          .label({
            xAnchor: moment(endTime).valueOf(),
            valueAnchor: b0 - dd * 0.382,
            text: "0.382" + " ( " + (b0 - dd * 0.382).toFixed(2) + " ) ",
            normal: { fontColor: "rgb(41, 98, 255)" },
          })
          .offsetY(-15)
          .fontSize(10);
        labela3.background({
          fill: "rgb(255, 255, 255)",
          stroke: "rgb(255, 255, 255)",
        });
        var linea5 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd * 0.5,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd * 0.5,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var labela5 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 - dd * 0.5,
          text: "0.5" + " ( " + (b0 - dd * 0.5).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        labela5
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var linea6 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd * 0.618,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd * 0.618,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var labela6 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 - dd * 0.618,
          text: "0.618" + " ( " + (b0 - dd * 0.618).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        labela6
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var linea7 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd * 0.786,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd * 0.786,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var labela7 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 - dd * 0.786,
          text: "0.786" + " ( " + (b0 - dd * 0.786).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        labela7
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var linea1 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd,
          normal: { stroke: "rgb(120,123,134)" },
        });
        // this.chart
        //   .plot(0)
        //   .yScale()
        //   .minimum(
        //     Math.min(...[(b0 - dd) * 0.99, this.globalMin]).toFixed(2)
        //   );
        var labela1 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 - dd,
          text: "1" + " ( " + (b0 - dd).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        labela1
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        annotationIndex.IntraFlineannotationIndex.push(linea2);
        annotationIndex.IntraFlineannotationIndex.push(linea3);
        annotationIndex.IntraFlineannotationIndex.push(linea5);
        annotationIndex.IntraFlineannotationIndex.push(linea6);
        annotationIndex.IntraFlineannotationIndex.push(linea7);
        annotationIndex.IntraFlineannotationIndex.push(linea1);
        annotationIndex.IntraFlineannotationIndex.push(labela2);
        annotationIndex.IntraFlineannotationIndex.push(labela3);
        annotationIndex.IntraFlineannotationIndex.push(labela5);
        annotationIndex.IntraFlineannotationIndex.push(labela6);
        annotationIndex.IntraFlineannotationIndex.push(labela7);
        annotationIndex.IntraFlineannotationIndex.push(labela1);
      }
      if (sdn == 2) {
        var lineb2 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd * 1.236,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd * 1.236,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var labelb2 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 - dd * 1.236,
          text: "1.236" + " ( " + (b0 - dd * 1.236).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        labelb2
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var lineb3 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd * 1.382,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd * 1.382,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var labelb3 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 - dd * 1.382,
          text: "1.382" + " ( " + (b0 - dd * 1.382).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        labelb3
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var lineb5 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd * 1.5,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd * 1.5,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var labelb5 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 - dd * 1.5,
          text: "1.5" + " ( " + (b0 - dd * 1.5).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        labelb5
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var lineb6 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd * 1.618,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd * 1.618,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var labelb6 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 - dd * 1.618,
          text: "1.618" + " ( " + (b0 - dd * 1.618).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        labelb6
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var lineb7 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd * 1.786,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd * 1.786,
          normal: { stroke: "rgb(120,123,134)" },
        });
        var labelb7 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 - dd * 1.786,
          text: "1.786" + " ( " + (b0 - dd * 1.786).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        labelb7
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        var lineb1 = controller.line({
          xAnchor: startTime,
          valueAnchor: b0 - dd * 2,
          secondXAnchor: endTime,
          secondValueAnchor: b0 - dd * 2,
          normal: { stroke: "rgb(120,123,134)" },
        });
        // this.chart
        //   .plot(0)
        //   .yScale()
        //   .minimum(
        //     Math.min(...[(b0 - dd * 2) * 0.99, this.globalMin]).toFixed(2)
        //   );
        var labelb1 = controller.label({
          xAnchor: moment(endTime).valueOf(),
          valueAnchor: b0 - dd * 2,
          text: "2" + " ( " + (b0 - dd * 2).toFixed(2) + " ) ",
          normal: { fontColor: "rgb(41, 98, 255)" },
        });
        labelb1
          .background({
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(255, 255, 255)",
          })
          .offsetY(-15)
          .fontSize(10);
        annotationIndex.IntraFlineannotationIndex.push(lineb2);
        annotationIndex.IntraFlineannotationIndex.push(lineb3);
        annotationIndex.IntraFlineannotationIndex.push(lineb5);
        annotationIndex.IntraFlineannotationIndex.push(lineb6);
        annotationIndex.IntraFlineannotationIndex.push(lineb7);
        annotationIndex.IntraFlineannotationIndex.push(lineb1);
        annotationIndex.IntraFlineannotationIndex.push(labelb2);
        annotationIndex.IntraFlineannotationIndex.push(labelb3);
        annotationIndex.IntraFlineannotationIndex.push(labelb5);
        annotationIndex.IntraFlineannotationIndex.push(labelb6);
        annotationIndex.IntraFlineannotationIndex.push(labelb7);
        annotationIndex.IntraFlineannotationIndex.push(labelb1);
      }
    }
  },
};

export default stockDataStore;
