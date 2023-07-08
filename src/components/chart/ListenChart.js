import { useEffect, useRef, forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import moment from "moment";
import anychart from "anychart";

import { drawingActions } from "../../store/drawing-slice";

import stockApi from "../../api/stock";

import indicatorApi from "../../api/indicator";

import drawingTool from "../toolbar/DRAWINGTOOL";

import annotationIndex from "../chart/annotationIndex";

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

  console.log(apiResult);

  let stockData = outputStockData(apiResult, adjustDividend);

  let visibleStockData = stockData.filter((p) => {
    return startPoint <= p[0] && endPoint >= p[0];
  });

  console.log(visibleStockData);

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

  console.log(bbars);

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
  console.log(volumes);
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
    if (update) {
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
    if (update) {
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
  }
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
  const currentStockTools = useSelector(
    (state) => state.indicator.currentStockTools
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
    plotIndex,
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
      var chartListenKey = props.chart.current.listen(
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
              endDate: moment(newEndDate),
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
                let chartTemp;
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
                        chartTemp = props.chart.current
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
                        chartTemp = props.chart.current
                          .plot(indicator.charts[p].plotIndex)
                          .getSeries(i)
                          .data(mapping)
                          .stroke(indicator.charts[p].stroke);
                        // console.log(indicator.charts[p].name);
                        // console.log(i);
                        // console.log(indicator.charts[p]);
                        // console.log(i);
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

            for await (let stockTool of currentStockTools) {
              console.log(stockTool);
              if (stockTool.name === "Volume Profile") {
                await drawVolumeProfileFunction(
                  stockTool,
                  props.chart.current,
                  ticker,
                  interval,
                  adjustDividend,
                  realTime
                );
              }
              if (stockTool.name === "Pivot Hi Lo") {
                await addFline(
                  props.chart,
                  interval,
                  tempStockData,
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
                  props.chart,
                  interval,
                  tempStockData,
                  stockTool,
                  ticker,
                  adjustDividend,
                  realStartTime,
                  realEndTime,
                  plotIndex,
                  true
                );
              }
              if (stockTool.name === "Linear Regression Channel on Pivot") {
                await addLinearRegression(
                  props.chart,
                  interval,
                  tempStockData,
                  stockTool,
                  ticker,
                  adjustDividend,
                  realStartTime,
                  realEndTime,
                  true
                );
              }
            }
          } else {
            // for volume profile only
            for (let stockTool of currentStockTools) {
              console.log(stockTool);
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

    return () => {
      if (chartListenKey) props.chart.current.unlistenByKey(chartListenKey);
    };
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
    currentStockTools,
    plotIndex,
  ]);

  return <div></div>;
}

export default ListenChart;
