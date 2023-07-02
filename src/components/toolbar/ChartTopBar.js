import "./ChartTopBar.css";

import { useSelector } from "react-redux";
import {
  Button,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  Col,
  Row,
} from "react-bootstrap";

import { Icon } from "@iconify/react";

import intervalSelection from "./INTERVAL";
import timezoneSelection from "./TIMEZONE";

import IndicatorSettings from "../settings/IndicatorSettings";
import DrawToolBar from "./DrawToolBar";

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
  const indicators = useSelector((state) => state.indicator.indicators);
  const currentIndicators = useSelector(
    (state) => state.indicator.currentIndicators
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
                      {intervalSelectedName(props.interval)}
                    </Tooltip>
                  }
                >
                  <span>{props.interval}</span>
                </OverlayTrigger>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Object.keys(intervalSelection).map((key, index) => {
                  return (
                    <div key={key}>
                      <Dropdown.Header key={key + index}>{key}</Dropdown.Header>
                      {intervalSelection[key].map((interval) => (
                        <Dropdown.Item
                          as="button"
                          key={interval.name + key}
                          onClick={() => props.changeInterval(interval)}
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
            <Button
              variant="light"
              size="sm"
              onClick={props.toggleRealTime}
              active={props.realTime}
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
          </main>
        </Col>
      </Row>
      <Row>
        <Col>
          <IndicatorSettings
            updateIndicator={props.updateIndicator}
            removeIndicator={props.removeIndicator}
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
