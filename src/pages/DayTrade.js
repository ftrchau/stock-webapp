import { useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";

import TheChart from "../components/chart/TheChart";
import SelectSearch from "../components/chart/SelectSearch";
import { indicatorActions } from "../store/indicator-slice";
import stockApi from "../api/stock";
import moment from "moment";
import { useDispatch } from "react-redux";
import { stockActions } from "../store/stock-slice";
import { BiArrowBack } from "react-icons/bi";

function DayTrade() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  if (!state) {
    navigate("/");
  } else {
    if (!("ticker" in state)) {
      navigate("/");
    }
  }
  const { ticker, label } = state;
  const setTicker = useCallback(
    (opt) => {
      navigate("/long-term-trade", {
        state: {
          ticker: opt.value,
          label: opt.label,
        },
      });
    },
    [navigate]
  );

  const initialPicked = useMemo(() => {
    return {
      indicators: ["Turtle Trade", "supertrend"],
      stockTools: ["Zig Zag + LR", "10AM Hi Lo fibo"],
    };
  }, []);

  useEffect(() => {
    dispatch(indicatorActions.resetCurrentIndicatorStockTools());
    dispatch(indicatorActions.setInitialLoad(true));
    const fetchData = async () => {
      const apiResult = await stockApi.getStockPrice({
        ticker,
        startDate: moment().subtract(3, "days").toDate(),
        endDate: moment().valueOf(),
        interval: "1m",
        adjustDividend: false,
        realTime: true,
      });

      dispatch(
        stockActions.setTradingPeriod({
          regularStart: apiResult.meta.currentTradingPeriod.regular.start,
          regularEnd: apiResult.meta.currentTradingPeriod.regular.end,
        })
      );

      dispatch(stockActions.setInterval("1m"));
      dispatch(stockActions.setStartDateEndDate("1m"));
      dispatch(stockActions.setRealTime(true));
    };

    fetchData();
  });

  return (
    <>
      <Container>
        <Row>
          <Col md={2} sm={3}>
            <Button variant="light" onClick={() => navigate("/")}>
              <BiArrowBack />
              Back
            </Button>
          </Col>
          <Col md={4}>
            <h3>Day Trade</h3>
          </Col>
          <Col>
            <SelectSearch ticker={ticker} label={label} setTicker={setTicker} />
          </Col>
        </Row>
      </Container>
      <TheChart ticker={ticker} initialPicked={initialPicked} />
    </>
  );
}

export default DayTrade;
