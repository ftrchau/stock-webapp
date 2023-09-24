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

import { useTranslation } from "react-i18next";

function LongTermTrade() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const ticker = useSelector((state) => state.stock.ticker.value);

  const initialPicked = useMemo(() => {
    return {
      indicators: ["MACD Modified", "supertrend"],
      stockTools: ["Pivot Hi Lo"],
      // indicators: [],
      // stockTools: ["Zig Zag + LR", "Pivot Hi Lo"],
    };
  }, []);

  useEffect(() => {
    if (ticker === "" || !ticker) {
      navigate("/stock-webapp");
    } else {
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
    }
  });

  return (
    <>
      <Container>
        <Row>
          <Col md={2} sm={3}>
            <Button variant="light" onClick={() => navigate("/stock-webapp/")}>
              <BiArrowBack />
              {t("back")}
            </Button>
          </Col>
          <Col md={4}>
            <h3>{t("MidtoLongTermTrade")}</h3>
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

export default LongTermTrade;
