import "./ChartTopBar.css";

import { useSelector, useDispatch } from "react-redux";
import {
  Dropdown,
  OverlayTrigger,
  Tooltip,
  Col,
  Row,
  NavDropdown,
} from "react-bootstrap";

import { Icon } from "@iconify/react";
import { FiTool } from "react-icons/fi";

import intervalSelection from "./INTERVAL";

import IndicatorSettings from "../settings/IndicatorSettings";
import StockToolSettings from "../settings/StockToolSettings";
import rangeSelection from "./RANGESELECTION";
import DrawToolBar from "./DrawToolBar";
import { useCallback } from "react";

import { indicatorActions } from "../../store/indicator-slice";
import { stockActions } from "../../store/stock-slice";

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
  const { addStockTool, updateStockTool, removeStockTool } = props;
  const indicators = useSelector((state) => state.indicator.indicators);
  const essentialIndicators = useSelector(
    (state) => state.indicator.indicators["Essential Indicators"]
  );
  const advancedIndicators = useSelector(
    (state) => state.indicator.indicators["Advanced Indicators"]
  );
  const lowTimeFrameIndicators = useSelector(
    (state) => state.indicator.indicators["Tools Suitable For Low Time Periods"]
  );
  const predictiveIndicators = useSelector(
    (state) => state.indicator.indicators["Predictive Indicators"]
  );
  const currentIndicators = useSelector(
    (state) => state.indicator.currentIndicators
  );
  const stockTools = useSelector((state) => state.indicator.stockTools);
  const currentStockTools = useSelector(
    (state) => state.indicator.currentStockTools
  );

  const interval = useSelector((state) => state.stock.interval);

  //console.log(rangeStartDate);
  //console.log(rangeEndDate);
  const dispatch = useDispatch();

  const changeRange = useCallback(
    (rangeOpt) => {
      dispatch(stockActions.setRangeOption(rangeOpt));
    },
    [dispatch]
  );

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
                    <Icon icon="mdi:finance" /> Essential Indicators
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {essentialIndicators.map((ind, index) => {
                  return (
                    <div key={index}>
                      <Dropdown.Item
                        as="button"
                        key={ind.name + index}
                        onClick={() => props.addIndicator(ind)}
                        active={currentIndicators
                          .map((opt) => opt.name)
                          .includes(ind.name)}
                      >
                        {ind.name}
                      </Dropdown.Item>
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
                    Advanced Indicators
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {advancedIndicators.map((ind, index) => {
                  return (
                    <div key={index}>
                      <Dropdown.Item
                        as="button"
                        key={ind.name + index}
                        onClick={() => props.addIndicator(ind)}
                        active={currentIndicators
                          .map((opt) => opt.name)
                          .includes(ind.name)}
                      >
                        {ind.name}
                      </Dropdown.Item>
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
                    Tools Suitable For Low Time Periods
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {lowTimeFrameIndicators.map((ind, index) => {
                  return (
                    <div key={index}>
                      <Dropdown.Item
                        as="button"
                        key={ind.name + index}
                        onClick={() => props.addIndicator(ind)}
                        active={currentIndicators
                          .map((opt) => opt.name)
                          .includes(ind.name)}
                      >
                        {ind.name}
                      </Dropdown.Item>
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
                    Predictive Indicators
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {predictiveIndicators.map((ind, index) => {
                  return (
                    <div key={index}>
                      <Dropdown.Item
                        as="button"
                        key={ind.name + index}
                        onClick={() => props.addIndicator(ind)}
                        active={currentIndicators
                          .map((opt) => opt.name)
                          .includes(ind.name)}
                      >
                        {ind.name}
                      </Dropdown.Item>
                    </div>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
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
          <DrawToolBar chart={props.chart} />
        </Col>
      </Row>
    </>
  );
}

export default ChartTopBar;
