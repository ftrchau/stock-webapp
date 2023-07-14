import React, { useEffect, useState } from "react";
import moment from "moment";
import { CRYPTO_COMPARE } from "../keys";
import { TradingViewEmbed, widgetType } from "react-tradingview-embed";
import {
  XYPlot,
  Hint,
  LineSeries,
  FlexibleXYPlot,
  VerticalBarSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  AreaSeries,
} from "react-vis";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const Dashboard = () => {
  const [times, setTimes] = useState([]);
  const [high, setHigh] = useState([]);
  const [low, setLow] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [query, setQuery] = useState("BTC");
  const [leaderboard, setLeaderboard] = useState([]);
  const [addressData, setAddressData] = useState("");
  const [symbol, setSymbol] = useState("");

  const loadChartData = async () => {
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/blockchain/histo/day?fsym=${query}&api_key=${CRYPTO_COMPARE}&limit=30`
    );
    const data = await response.json();
    const bulkData = data.Data.Data;
    const dataArray = bulkData.map((y) => ({
      x: y.time * 1000,
      y: y.transaction_count * y.average_transaction_value,
    }));
    setChartData(dataArray);
    setSymbol(query);
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  useEffect(() => {
    loadChartData();
  }, []);

  return (
    <div>
      <div className="inputDiv">
        <input
          placeholder="Search for a symbol"
          value={query}
          onChange={handleInputChange}
          className="dataRequest"
        />
        <button onClick={loadChartData} className="dataRequest">
          Load Onchain Data
        </button>
        <TradingViewEmbed
          widgetType={widgetType.TICKER_TAPE}
          widgetConfig={{
            showSymbolLogo: true,
            isTransparent: true,
            displayMode: "adaptive",
            colorTheme: "dark",
            autosize: true,
            symbols: [
              {
                proName: "BITSTAMP:ETHUSD",
                title: "ETH/USD",
              },
              {
                proName: "BITSTAMP:BTCUSD",
                title: "BTC/USD",
              },
              {
                proName: "BINANCE:BNBUSDT",
                title: "BNB/USDT",
              },
              {
                proName: "BINANCE:ADAUSD",
                title: "ADA/USD",
              },
              {
                proName: "BINANCE:DOTUSDT",
                title: "DOT/USDT",
              },
              {
                proName: "UNISWAP:UNIUSDT",
                title: "UNI/USDT",
              },
            ],
          }}
        />
      </div>
      <div className="charty">
        {query.length > 2 ? (
          <TradingViewEmbed
            widgetType={widgetType.ADVANCED_CHART}
            widgetConfig={{
              interval: "1D",
              colorTheme: "dark",
              width: "100%",
              symbol: query + "USD",
              studies: [
                "MACD@tv-basicstudies",
                "StochasticRSI@tv-basicstudies",
                "TripleEMA@tv-basicstudies",
              ],
            }}
          />
        ) : (
          "BTCUSD"
        )}

        <div className="taChart">
          <div className="addressHover">
            <HoverHint data={addressData} query={query} symbol={symbol} />
          </div>
          <FlexibleXYPlot className="onChainChart" height={400}>
            <VerticalBarSeries
              data={chartData}
              opacity={0.3}
              color={"#40FEFF"}
              onNearestX={(datapoint, event) => {
                setAddressData({
                  time: new Date(datapoint.x).toLocaleDateString(),
                  price: datapoint.y,
                });
                //console.log(addressData);
              }}
            />

            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis
              tickFormat={(value) =>
                new Date(value).toLocaleDateString().split(" ")
              }
              tickValues={chartData.x}
              title={"Dates"}
              style={{
                line: { stroke: "#ffffff" },
                ticks: { stroke: "#ffffff" },
                text: {
                  stroke: "none",
                  fill: "#ffffff",
                  fontWeight: 3,
                  fontSize: 8,
                  position: "start",
                },
                title: { fill: "#ffffff" },
              }}
            />
            <YAxis
              tickFormat={(value) => value / 1}
              width={40}
              tickValues={chartData.y}
              style={{
                line: { stroke: "#ffffff", marginRight: 50 },
                ticks: { stroke: "#fffff" },
                text: {
                  stroke: "none",
                  fill: "#ffffff",
                  fontWeight: 3,
                  fontSize: 7,
                  position: "start",
                },
                title: { fill: "#ffffff" },
              }}
            />
          </FlexibleXYPlot>
          {query.length > 2 ? (
            <TradingViewEmbed
              widgetType={widgetType.TECHNICAL_ANALYSIS}
              widgetConfig={{
                interval: "1D",
                colorTheme: "dark",
                width: "100%",
                symbol: query + "USD",
              }}
            />
          ) : (
            query
          )}

          {query.length > 2 ? (
            <TradingViewEmbed
              widgetType={widgetType.COMPANY_PROFILE}
              widgetConfig={{
                colorTheme: "dark",
                width: "100%",
                symbol: query + "USD",
              }}
            />
          ) : (
            "BTCUSD"
          )}
        </div>
      </div>

      {chartData.map((x) => (
        <Chart key={x.x} time={x.x} active_addresses={x.y} />
      ))}
    </div>
  );
};

const Chart = (props) => {
  return (
    <div>
      <div className="chart">
        <p className="chart-data" key={props.time}>
          {"time" + props.time}
        </p>
        <p className="chart-data" key={props.active_addresses}>
          {"active addresses" + props.active_addresses}
        </p>
      </div>
    </div>
  );
};

const Leader = (props) => {
  return (
    <div className="leaderItem">
      <a href={props.url} target="#">
        <img src={props.logo} alt={props.symbol} className="logo" />
      </a>
      <p className="leaderText">{props.symbol}</p>
      <p className="leaderText">{props.price}</p>
    </div>
  );
};

const HoverHint = ({ active, data, query, symbol }) => (
  <div className={`nonActive ${active ? "active" : ""}`}>
    <p className="hoverData">
      {data.length > 1
        ? query
        : symbol.toUpperCase() +
          "  - Raw Averaged Volume (Transactions * Average Value $USD)"}
    </p>
    <p className="hoverData">
      {data.length < 1 ? "" : data.time + " - " + formatter.format(data.price)}{" "}
    </p>
  </div>
);

export default Dashboard;
