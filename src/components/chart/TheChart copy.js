import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";

import { useQuery } from "react-query";

import moment from "moment";
import AnyChart from "anychart-react";
import anychart from "anychart";

import ChartTopBar from "../toolbar/ChartTopBar";

import { getStockData } from "../../api/stock";

import { useDispatch } from "react-redux";
import { indicatorActions } from "../../store/indicator-slice";

import indicatorApi from "../../api/indicator";
import stockApi from "../../api/stock";

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
  console.log(data);
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

function TheChart(props) {
  const dispatch = useDispatch();

  const { ticker } = props;
  const [startDate, setStartDate] = useState(
    moment().subtract(21, "month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [interval, setInterval] = useState("1d");
  const [adjustDividend, setAdjustDividend] = useState(false);
  const [realTime, setRealTime] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [timezone, setTimezone] = useState({});

  const [changeIndicatorSetting, setChangeIndicatorSetting] = useState(false);

  const chart = useRef(null);
  const chartTable = useRef(null);
  const chartMapping = useRef(null);
  // const timezone = useRef({});
  const exchangeTimeZone = useRef({});
  const realStartTime = useRef(
    moment().subtract(21, "month").format("YYYY-MM-DD")
  );
  const realEndTime = useRef(moment().format("YYYY-MM-DD"));

  const currentIndicators = useSelector(
    (state) => state.indicator.currentIndicators
  );

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

  useEffect(() => {
    console.log("RUNNING");
    console.log(currentIndicators);
    if (!data) return;
    let newStockData = data.quotes.map((p) => {
      return [
        moment(p.date).valueOf(),
        // moment(p.date).format("YYYY-MM-DD"),
        p.open,
        p.high,
        p.low,
        adjustDividend ? p.adjclose : p.close,
      ];
    });
    console.log(newStockData);
    setStockData(newStockData);
    exchangeTimeZone.current = {
      name: "Exchange",
      value: Number(data.meta.gmtoffset) / 3600,
    };
    if (Object.keys(timezone).length === 0) {
      setTimezone(exchangeTimeZone.current);
      console.log("triggered?");
    }

    anychart.format.outputTimezone(timezone.value * 60 * -1);
    chart.current = new anychart.stock();
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
    chart.current.selectRange(
      moment(newStockData[newStockData.length - 1][0])
        .subtract(9, scrollLeftTimeUnit(interval))
        .format("YYYY-MM-DD HH:mm:ss"),
      moment(newStockData[newStockData.length - 1][0]).format(
        "YYYY-MM-DD HH:mm:ss"
      )
    );
    chart.current
      .crosshair()
      .yLabel()
      .format(function () {
        return this.rawValue.toFixed(2);
      });

    if (["m", "h"].includes(interval.charAt(interval.length - 1))) {
      chart.current
        .crosshair()
        .xLabel()
        .format("{%rawValue}{dateTimeFormat:yyyy MMM dd HH:mm }");
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

    var tempPrevStartDate;
    var newStartDate = startDate;
    var newEndDate = endDate;
    var tempStockData = newStockData;

    let selectRangeListenkey = chart.current.listen(
      "selectedrangechangefinish",
      async function (e) {
        var max = getStockMax(tempStockData, e.firstVisible, e.lastSelected);
        var min = getStockMin(tempStockData, e.firstVisible, e.lastSelected);

        chart.current.plot(0).yScale().maximum(max.toFixed(2));
        chart.current.plot(0).yScale().minimum(min.toFixed(2));

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
          chart.current.grouping().enabled(false);
          console.log(tempStockData);
          chartTable.current.addData(tempStockData);
          chartMapping.current = chartTable.current.mapAs({
            open: 1,
            high: 2,
            low: 3,
            close: 4,
          });
          console.log(
            tempPrevStartDate
              .clone()
              .subtract(6, scrollLeftTimeUnit(interval))
              .valueOf()
          );
          console.log(tempPrevStartDate.valueOf());
          chart.current.selectRange(
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

          chart.current.plot(0).yScale().maximum(max.toFixed(2));
          chart.current.plot(0).yScale().minimum(min.toFixed(2));
          console.log("this listen running?");
          console.log(currentIndicators);
          for await (let indicator of currentIndicators) {
            let apiInputParam = {};
            indicator.parameters.forEach((opt) => {
              apiInputParam[opt.name] = +opt.value;
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
            indicator.charts.forEach((ind) => {
              var addResult = allResult.map((p) => {
                return [p.date, +p[ind.column]];
              });

              var table = anychart.data.table();
              table.addData(addResult);
              var mapping = table.mapAs();
              mapping.addField("value", 1);
              var seriesLength = chart.current.plot(0).getSeriesCount();
              for (let i = seriesLength - 1; i > -1; i--) {
                if (chart.current.plot(0).getSeries(i)) {
                  let seriesName = chart.current.plot(0).getSeries(i).name();
                  if (seriesName === ind.name) {
                    chart.current.plot(0).getSeries(i).data(mapping);
                  }
                }
              }

              // chart.current.plot(0).line(mapping).name(ind.name);
              chart.current.selectRange(
                moment(realEndTime.current)
                  .subtract(10, scrollLeftTimeUnit(interval))
                  .format("YYYY-MM-DD HH:mm:ss"),
                moment(realEndTime.current).format("YYYY-MM-DD HH:mm:ss")
              );
            });
          }
        }
      }
    );

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

    let sideEffect = () => {
      const addIndicator = async () => {
        console.log("sideEffect is running");
        for await (let indicator of currentIndicators) {
          let apiInputParam = {};
          indicator.parameters.forEach((opt) => {
            apiInputParam[opt.name] = +opt.value;
          });
          console.log(apiInputParam);
          let allResult = await indicatorCallback(indicator.apiFunc, {
            ...apiInputParam,
            ticker,
            interval,
            adjustDividend,
            startDate: realStartTime.current,
            endDate: realEndTime.current,
            realTime,
          });
          indicator.charts.forEach((ind) => {
            var addResult = allResult.map((p) => {
              return [p.date, +p[ind.column]];
            });

            var table = anychart.data.table();
            table.addData(addResult);
            var mapping = table.mapAs();
            mapping.addField("value", 1);

            chart.current.plot(0).line(mapping).name(ind.name);
            chart.current.selectRange(
              moment(realEndTime.current)
                .subtract(10, scrollLeftTimeUnit(interval))
                .format("YYYY-MM-DD HH:mm:ss"),
              moment(realEndTime.current).format("YYYY-MM-DD HH:mm:ss")
            );
          });
        }
      };
      addIndicator();
    };
    if (changeIndicatorSetting) sideEffect();

    return () => {
      chart.current.unlistenByKey(selectRangeListenkey);
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
    currentIndicators,
    changeIndicatorSetting,
  ]);

  const changeInterval = useCallback((interval) => {
    setInterval(interval.value);
  }, []);

  const toggleRealTime = useCallback(() => {
    setRealTime((prev) => !prev);
  }, []);

  const changeTimeZone = useCallback((opt) => {
    if (opt.name === "Exchange") opt.value = exchangeTimeZone.current.value;
    if (opt.value === exchangeTimeZone.current.value) opt.name = "Exchange";
    console.log(opt);
    anychart.format.outputTimezone(opt.value * 60 * -1);
    setTimezone(opt);
  }, []);

  const addIndicator = useCallback(
    (indicator) => {
      setChangeIndicatorSetting(true);
      dispatch(indicatorActions.addIndicator(indicator));
    },
    [dispatch, setChangeIndicatorSetting]
  );
  // const addIndicator = useCallback(
  //   async (indicator) => {
  //     setChangeIndicatorSetting(false);

  //     dispatch(indicatorActions.addIndicator(indicator));
  //     console.log(indicator);

  //     let apiInputParam = {};
  //     indicator.parameters.forEach((opt) => {
  //       apiInputParam[opt.name] = +opt.value;
  //     });

  //     let allResult = await indicatorCallback(indicator.apiFunc, {
  //       ...apiInputParam,
  //       ticker,
  //       interval,
  //       adjustDividend,
  //       startDate: realStartTime.current,
  //       endDate: realEndTime.current,
  //       realTime,
  //     });

  //     indicator.charts.forEach((ind) => {
  //       let addResult = allResult.map((p) => {
  //         return [p.date, +p[ind.column]];
  //       });
  //       var table = anychart.data.table();
  //       table.addData(addResult);
  //       var mapping = table.mapAs();
  //       mapping.addField("value", 1);
  //       chart.current.plot(0).line(mapping).name(ind.name);
  //       console.log(stockData);
  //       chart.current.selectRange(
  //         moment(realEndTime.current)
  //           .subtract(10, scrollLeftTimeUnit(interval))
  //           .format("YYYY-MM-DD HH:mm:ss"),
  //         moment(realEndTime.current).format("YYYY-MM-DD HH:mm:ss")
  //       );
  //     });
  //   },
  //   [dispatch, ticker, interval, adjustDividend, realTime, stockData]
  // );

  if (isFetching) return "Loading...";

  if (error) return "An error has occured:" + error.message;

  return (
    <>
      <ChartTopBar
        addIndicator={addIndicator}
        changeInterval={changeInterval}
        toggleRealTime={toggleRealTime}
        changeTimeZone={changeTimeZone}
        interval={interval}
        realTime={realTime}
        timezone={timezone}
        changeIndicatorSetting={() => setChangeIndicatorSetting(true)}
      />
      <AnyChart
        id="stock-chart"
        width="100%"
        height="100%"
        instance={chart.current}
        title={ticker}
      />
    </>
  );
}

export default TheChart;
