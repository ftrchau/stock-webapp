import { useEffect, useState } from "react";

import TheChart from "../components/chart/TheChart";

import stockApi from "../api/stock";
import moment from "moment";
import { useDispatch } from "react-redux";
import { stockActions } from "../store/stock-slice";

function DayTrade() {
  const dispatch = useDispatch();
  const [ticker, setTicker] = useState("TSLA");

  useEffect(() => {
    const fetchData = async () => {
      const apiResult = await stockApi.getStockPrice({
        ticker,
        startDate: moment().subtract(60, "month").toDate(),
        endDate: moment().valueOf(),
        interval: "1d",
        adjustDividend: false,
        realTime: false,
      });

      dispatch(
        stockActions.setTradingPeriod({
          regularStart: apiResult.meta.currentTradingPeriod.regular.start,
          regularEnd: apiResult.meta.currentTradingPeriod.regular.end,
        })
      );
    };

    fetchData();
  });

  return (
    <>
      <h3>Day Trade</h3>
      <TheChart ticker={ticker} />
    </>
  );
}

export default DayTrade;
