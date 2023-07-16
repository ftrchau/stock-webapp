import { useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";

import TheChart from "../components/chart/TheChart";
import SelectSearch from "../components/chart/SelectSearch";
import { indicatorActions } from "../store/indicator-slice";
import stockApi from "../api/stock";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { stockActions } from "../store/stock-slice";
import { BiArrowBack } from "react-icons/bi";

function DayTrade() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ticker = useSelector((state) => state.stock.ticker.value);

  const initialPicked = useMemo(() => {
    return {
      indicators: ["Turtle Trade", "supertrend"],
      stockTools: ["Zig Zag + LR", "10AM Hi Lo fibo"],
    };
  }, []);

  useEffect(() => {
    if (ticker === "" || !ticker) {
      navigate("/stock-webapp");
    } else {
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
    }
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
            <h3>Day Trade</h3>
          </Col>
          <Col>
            <SelectSearch />
          </Col>
        </Row>
      </Container>
      <TheChart ticker={ticker} initialPicked={initialPicked} />
    </>
  );
}

export default DayTrade;
