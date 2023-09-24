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
import rangeSelection from "./RANGESELECTION";
import DrawToolBar from "./DrawToolBar";
import { useCallback } from "react";

import { indicatorActions } from "../../store/indicator-slice";
import { stockActions } from "../../store/stock-slice";

import { useTranslation } from "react-i18next";

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
  const { addStockTool } = props;
  const essentialIndicators = useSelector(
    (state) => state.indicator.indicators["Essential Indicators"]
  );
  const advancedIndicators = useSelector(
    (state) => state.indicator.indicators["Advanced Indicators"]
  );
  // const lowTimeFrameIndicators = useSelector(
  //   (state) => state.indicator.indicators["Tools Suitable For Low Time Periods"]
  // );
  const currentIndicators = useSelector(
    (state) => state.indicator.currentIndicators
  );
  // const stockTools = useSelector((state) => state.indicator.stockTools);
  const stockTools = useSelector(
    (state) => state.indicator.indicators["Tools Suitable For Low Time Periods"]
  );
  const currentStockTools = useSelector(
    (state) => state.indicator.currentStockTools
  );

  const interval = useSelector((state) => state.stock.interval);

  //console.log(rangeStartDate);
  //console.log(rangeEndDate);
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const changeRange = useCallback(
    (rangeOpt) => {
      dispatch(stockActions.setRangeOption(rangeOpt));
    },
    [dispatch]
  );

  const changeInterval = useCallback(
    (interval) => {
      dispatch(stockActions.setStartDateEndDate(interval.value));
      dispatch(indicatorActions.setNeedUpdate(true));
    },
    [dispatch]
  );

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
                      {t(`intervalSelection.${intervalSelectedName(interval)}`)}
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
                              {t("choosePeriod")}
                            </Tooltip>
                          }
                        >
                          <NavDropdown
                            title={t(`intervalSelection.${key}`)}
                            id="nav-dropdown"
                          >
                            {rangeSelection[key].map((rangeOpt) => (
                              <NavDropdown.Item
                                eventKey="4.1"
                                onClick={() => changeRange(rangeOpt)}
                              >
                                {t(`intervalSelection.${rangeOpt.label}`)}
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
                          {t(`intervalSelection.${interval.name}`)}
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
                      {t("SelectIndicators")}
                    </Tooltip>
                  }
                >
                  <span>
                    <Icon icon="mdi:finance" /> {t("EssentialIndicators")}
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
                        {t(`indicator.${ind.name}`)}
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
                      {t("SelectIndicators")}
                    </Tooltip>
                  }
                >
                  <span>
                    <FiTool />
                    {t("AdvancedIndicators")}
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
                        {t(`indicator.${ind.name}`)}
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
                      {t("SelectTools")}
                    </Tooltip>
                  }
                >
                  <span>
                    <FiTool />
                    {t("ToolsSuitableForLowTimePeriods")}
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {stockTools.map((ind, index) => {
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
                        {t(`indicator.${ind.name}`)}
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
