import "./ChartTopBar.css";

import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  Col,
  Row,
  NavDropdown,
} from "react-bootstrap";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker-cssmodules.css";

import "react-datepicker/dist/react-datepicker.css";

import { Icon } from "@iconify/react";
import { FiTool } from "react-icons/fi";
import { BsCalendar } from "react-icons/bs";

import intervalSelection from "./INTERVAL";
import timezoneSelection from "./TIMEZONE";

import IndicatorSettings from "../settings/IndicatorSettings";
import StockToolSettings from "../settings/StockToolSettings";
import rangeSelection from "./RANGESELECTION";
import DrawToolBar from "./DrawToolBar";
import { useCallback } from "react";

import { indicatorActions } from "../../store/indicator-slice";
import { stockActions } from "../../store/stock-slice";

import moment from "moment";

const intervalSelectedName = (interval) => {
  let intervalTitle = "";

  for (const intervalGroup in intervalSelection) {
    let intervalSelectFind = intervalSelection[intervalGroup].find(
      (p) => p.value === interval
    );
    if (intervalSelectFind) {
      intervalTitle = intervalSelectFind.name;
      break;
    }
  }
  return intervalTitle;
};

function ChartTopBar(props) {
  const { chart, stockData, addStockTool, updateStockTool, removeStockTool } =
    props;
  const indicators = useSelector((state) => state.indicator.indicators);
  const currentIndicators = useSelector(
    (state) => state.indicator.currentIndicators
  );
  const stockTools = useSelector((state) => state.indicator.stockTools);
  const currentStockTools = useSelector(
    (state) => state.indicator.currentStockTools
  );
  const rangeStartDate = useSelector((state) => state.stock.rangeStartDate);

  const rangeEndDate = useSelector((state) => state.stock.rangeEndDate);
  const interval = useSelector((state) => state.stock.interval);
  const realTime = useSelector((state) => state.stock.realTime);
  // const stockData = useSelector((state) => state.stock.stockData);
  //console.log(rangeStartDate);
  //console.log(rangeEndDate);
  const dispatch = useDispatch();

  const changeRange = useCallback(
    (rangeOpt) => {
      dispatch(stockActions.setRangeOption(rangeOpt));
    },
    [dispatch]
  );

  const setRangeStartDate = useCallback(
    (inputDate) => {
      ////console.log(inputDate);
      dispatch(stockActions.setRangeStartDate(inputDate));
    },
    [dispatch]
  );
  const setRangeEndDate = useCallback(
    (inputDate) => {
      ////console.log(inputDate);
      dispatch(stockActions.setRangeEndDate(inputDate));
    },
    [dispatch]
  );

  const setLongestRange = useCallback(() => {
    dispatch(stockActions.setLongestRange());
    ////console.log(stockData);
    const max = Math.max(
      ...stockData.filter((p) => p[2] != null).map((p) => p[2])
    );
    const min = Math.min(
      ...stockData.filter((p) => p[3] != null).map((p) => p[3])
    );

    chart.current.plot(0).yScale().maximum(max.toFixed(2));
    chart.current.plot(0).yScale().minimum(min.toFixed(2));
  }, [dispatch, stockData, chart]);

  const changeInterval = useCallback(
    (interval) => {
      // setInterval(interval.value);
      ////console.log(interval.value);
      dispatch(stockActions.setStartDateEndDate(interval.value));
      dispatch(indicatorActions.setNeedUpdate(true));
    },
    [dispatch]
  );

  const addStockToolCallback = useCallback(
    (stockTool) => {
      if (currentStockTools.map((p) => p.name).includes(stockTool.name)) {
        return;
      }
      addStockTool(stockTool);
    },
    [addStockTool, currentStockTools]
  );

  // useEffect(() => {
  //   const addInititalIndicators = async () => {
  //     for await (let indicator of initialPicked.indicators) {
  //       ////console.log(
  //         [
  //           ...indicators["Traditional Indicator"],
  //           ...indicators["Innovative Indicators"],
  //         ].find((ind) => ind.name === indicator)
  //       );
  //       await addIndicator(
  //         [
  //           ...indicators["Traditional Indicator"],
  //           ...indicators["Innovative Indicators"],
  //         ].find((ind) => ind.name === indicator)
  //       );
  //     }
  //   };

  //   // const addInitialStockTools = async () => {
  //   //   for (let stockTool of initialPicked.stockTools) {
  //   //     dispatch(
  //   //       indicatorActions.addStockTools(
  //   //         stockTools.find((st) => st.name === stockTool)
  //   //       )
  //   //     );
  //   //     //  stockTools.find((st) => st.name === stockTool);
  //   //   }
  //   // };

  //   addInititalIndicators();
  //   // addInitialStockTools();
  // }, [initialPicked, addIndicator, indicators, dispatch]);

  return (
    <>
      <Row>
        <Col>
          <main className="main">
            <Dropdown>
              <Dropdown.Toggle variant="light" id="dropdown-interval" size="sm">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="tooltip-interval">
                      {intervalSelectedName(interval)}
                    </Tooltip>
                  }
                >
                  <span>{interval}</span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Object.keys(intervalSelection).map((key, index) => {
                  return (
                    <div key={key}>
                      <Dropdown.Header key={key + index}>
                        <OverlayTrigger
                          key="bottom"
                          placement="bottom"
                          overlay={
                            <Tooltip className="tooltip" id="tooltip-range">
                              Select Range
                            </Tooltip>
                          }
                        >
                          <NavDropdown title={key} id="nav-dropdown">
                            {rangeSelection[key].map((rangeOpt) => (
                              <NavDropdown.Item
                                eventKey="4.1"
                                onClick={() => changeRange(rangeOpt)}
                              >
                                {rangeOpt.label}
                              </NavDropdown.Item>
                            ))}
                          </NavDropdown>
                        </OverlayTrigger>
                      </Dropdown.Header>
                      {intervalSelection[key].map((interval) => (
                        <Dropdown.Item
                          as="button"
                          key={interval.name + key}
                          onClick={() => changeInterval(interval)}
                        >
                          {interval.name}
                        </Dropdown.Item>
                      ))}
                    </div>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                id="dropdown-indicator"
                size="sm"
              >
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="tooltip-indicator">
                      Select Indicators
                    </Tooltip>
                  }
                >
                  <span>
                    <Icon icon="mdi:finance" /> Indicators
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Object.keys(indicators).map((key, index) => {
                  return (
                    <div key={key}>
                      <Dropdown.Header key={key + index}>{key}</Dropdown.Header>
                      {indicators[key].map((ind) => (
                        <Dropdown.Item
                          as="button"
                          key={ind.name + key}
                          onClick={() => props.addIndicator(ind)}
                          active={currentIndicators
                            .map((opt) => opt.value)
                            .includes(ind.value)}
                        >
                          {ind.name}
                        </Dropdown.Item>
                      ))}
                    </div>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                id="dropdown-stocktool"
                size="sm"
              >
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="tooltip-stocktool">
                      Select Stock Tool
                    </Tooltip>
                  }
                >
                  <span>
                    <FiTool />
                    Stock Tools
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <div>
                  {stockTools.map((tool, index) => {
                    return (
                      <Dropdown.Item
                        as="button"
                        key={index}
                        onClick={() => addStockToolCallback(tool)}
                        active={currentStockTools
                          .map((opt) => opt.name)
                          .includes(tool.name)}
                      >
                        {tool.name}
                      </Dropdown.Item>
                    );
                  })}
                </div>
              </Dropdown.Menu>
            </Dropdown>
            <Button
              variant="light"
              size="sm"
              onClick={props.toggleRealTime}
              active={realTime}
              style={{ whiteSpace: "nowrap" }}
            >
              Toggle realtime
            </Button>
            <Dropdown>
              <Dropdown.Toggle variant="light" id="dropdown-timezone" size="sm">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="tooltip-timezone">
                      Change Timezone
                    </Tooltip>
                  }
                >
                  <span>
                    {"UTC(" +
                      (props.timezone.value > 0 ? "+" : "") +
                      props.timezone.value +
                      ")"}
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  as="button"
                  onClick={() =>
                    props.changeTimeZone({ name: "UTC", value: 0 })
                  }
                  active={props.timezone.value === 0}
                >
                  UTC
                </Dropdown.Item>
                <Dropdown.Item
                  as="button"
                  onClick={() =>
                    props.changeTimeZone({ name: "Exchange", value: 0 })
                  }
                  active={props.timezone.name === "Exchange"}
                >
                  Exchange
                </Dropdown.Item>
                {timezoneSelection.map((timezone) => (
                  <Dropdown.Item
                    as="button"
                    key={timezone.name}
                    onClick={() => props.changeTimeZone(timezone)}
                    active={timezone.value === props.timezone.value}
                  >
                    {"UTC(" +
                      (timezone.value > 0 ? "+" : "") +
                      timezone.value +
                      ")" +
                      timezone.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <div className="pe-1 ps-1">From</div>
            <BsCalendar />
            {interval.charAt(interval.length - 1) !== "m" &&
              interval.charAt(interval.length - 1) !== "h" && (
                <DatePicker
                  selected={rangeStartDate}
                  dateFormat="yyyy-MMM-dd"
                  className="react-datetime-input"
                  onChange={(date) => setRangeStartDate(date)}
                />
              )}
            {(interval.charAt(interval.length - 1) === "m" ||
              interval.charAt(interval.length - 1) === "h") && (
              <span style={{ whiteSpace: "nowrap" }}>
                {moment(rangeStartDate).format("YYYY-MM-DD hh:mm:ss")}
              </span>
            )}
            <div className="pe-1 ps-1">To</div>
            <BsCalendar />
            {interval.charAt(interval.length - 1) !== "m" &&
              interval.charAt(interval.length - 1) !== "h" && (
                <DatePicker
                  selected={rangeEndDate}
                  dateFormat="yyyy-MMM-dd"
                  className="react-datetime-input"
                  onChange={(date) => setRangeEndDate(date)}
                />
              )}
            {(interval.charAt(interval.length - 1) === "m" ||
              interval.charAt(interval.length - 1) === "h") && (
              <span style={{ whiteSpace: "nowrap" }}>
                {moment(rangeEndDate).format("YYYY-MM-DD hh:mm:ss")}
              </span>
            )}
            <Button
              variant="light"
              size="sm"
              onClick={() => setLongestRange()}
              style={{ whiteSpace: "nowrap" }}
            >
              Longest Time
            </Button>
          </main>
        </Col>
      </Row>
      <Row>
        <Col>
          <IndicatorSettings
            updateIndicator={props.updateIndicator}
            removeIndicator={props.removeIndicator}
            showIndicator={props.showIndicator}
            hideIndicator={props.hideIndicator}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <StockToolSettings
            updateStockTool={updateStockTool}
            removeStockTool={removeStockTool}
            showStockTool={props.showStockTool}
            hideStockTool={props.hideStockTool}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <DrawToolBar chart={props.chart} />
        </Col>
      </Row>
    </>
  );
}

export default ChartTopBar;
