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

function LongTermTrade() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  if (!state) {
    navigate("/stock-webapp/");
  } else {
    if (!("ticker" in state)) {
      navigate("/stock-webapp/");
    }
  }
  const { ticker, label } = state;
  const setTicker = useCallback(
    (opt) => {
      navigate("/stock-webapp/long-term-trade", {
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
      indicators: ["RSI Modified", "MACD Modified", "supertrend"],
      stockTools: ["Zig Zag + LR", "Pivot Hi Lo"],
    };
  }, []);

  useEffect(() => {
    dispatch(indicatorActions.resetCurrentIndicatorStockTools());
    dispatch(stockActions.setInterval("1d"));
    dispatch(stockActions.setStartDateEndDate("1d"));
    dispatch(stockActions.setRealTime(false));
    dispatch(indicatorActions.setInitialLoad(true));
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
      <Container>
        <Row>
          <Col md={2} sm={3}>
            <Button variant="light" onClick={() => navigate("/stock-webapp/")}>
              <BiArrowBack />
              Back
            </Button>
          </Col>
          <Col md={4}>
            <h3>Mid to Long Term Trade</h3>
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

export default LongTermTrade;
