import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { drawingActions } from "../../store/drawing-slice";

import { useTranslation } from "react-i18next";

import {
  Button,
  Container,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  Row,
  Col,
} from "react-bootstrap";

import { Icon } from "@iconify/react";
import { TfiText } from "react-icons/tfi";
import { BsCalendar } from "react-icons/bs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker-cssmodules.css";

import "react-datepicker/dist/react-datepicker.css";

import classes from "./ChartToolBar.module.css";

import drawingTool from "./DRAWINGTOOL";
import markerType from "./MARKERTYPE";

import timezoneSelection from "./TIMEZONE";

import { stockActions } from "../../store/stock-slice";

import moment from "moment";

function ChartToolBar({
  chart,
  horizontal,
  toggleRealTime,
  timezone,
  changeTimeZone,
  stockData,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const colorFill = useSelector((state) => state.drawing.colorFill);
  const colorStroke = useSelector((state) => state.drawing.colorStroke);
  const fontColor = useSelector((state) => state.drawing.fontColor);
  const fontSize = useSelector((state) => state.drawing.fontSize);
  const fontWeight = useSelector((state) => state.drawing.fontWeight);

  const markerColorFill = useSelector((state) => state.drawing.markerColorFill);
  const markerColorStroke = useSelector(
    (state) => state.drawing.markerColorStroke
  );
  const markerSizeSelected = useSelector(
    (state) => state.drawing.markerSizeSelected
  );
  const realTime = useSelector((state) => state.stock.realTime);

  const rangeStartDate = useSelector((state) => state.stock.rangeStartDate);

  const rangeEndDate = useSelector((state) => state.stock.rangeEndDate);
  const interval = useSelector((state) => state.stock.interval);

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

  const addAnnotation = useCallback(
    (annotation) => {
      if (
        drawingTool
          .map((tool) => tool.annotationType)
          .includes(annotation.annotationType)
      )
        dispatch(drawingActions.setDrawingToolSelected(annotation));

      console.log(annotation.annotationType);
      if (annotation.annotationType === "marker") {
        console.log(annotation);
        dispatch(drawingActions.setMarkerTypeSelected(annotation));
      }
      if (annotation.annotationType) {
        var drawingSettings = {
          type: annotation.annotationType,
          size: markerSizeSelected,
        };

        drawingSettings.fill = colorFill;
        drawingSettings.stroke = colorStroke;

        if (annotation.annotationType === "label") {
          drawingSettings.text = "Text";
          drawingSettings.fontSize = fontSize;
          drawingSettings.fontColor = fontColor;
          drawingSettings.fontWeight = fontWeight;
        } else if (annotation.annotationType === "marker") {
          drawingSettings.markerType = annotation.markerType;
          drawingSettings.markerAnchor = annotation.markerAnchor;
          drawingSettings.fill = markerColorFill;
          drawingSettings.stroke = {
            color: markerColorStroke,
          };
        } else {
        }

        chart.current.annotations().startDrawing(drawingSettings);
      }
    },
    [
      dispatch,
      colorFill,
      colorStroke,
      chart,
      fontSize,
      fontColor,
      fontWeight,
      markerColorFill,
      markerColorStroke,
      markerSizeSelected,
    ]
  );

  const style = horizontal
    ? { display: "flex", width: "60px" }
    : {
        backgroundColor: "white",
        boxShadow: "1px 1px 7px rgba(0, 0, 0, 0.15)",
        height: "100vh",
        width: "60px",
      };

  return (
    <div style={style}>
      <Dropdown drop="end">
        <Dropdown.Toggle variant="light" size="sm" id="dropdown-line">
          <OverlayTrigger
            key="right"
            placement="right"
            overlay={
              <Tooltip className="tooltip" id="tooltip-drawing-tools">
                {t("drawingTools")}
              </Tooltip>
            }
          >
            <Icon icon="ph:line-segment-thin" />
          </OverlayTrigger>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {drawingTool.map((tool, index) => {
            return (
              <Dropdown.Item key={index} onClick={() => addAnnotation(tool)}>
                <Container fluid>
                  <Row>
                    <Col md="1">
                      <span className={tool.icon}></span>
                    </Col>
                    <Col md="5">{t(`drawingTool.${tool.name}`)}</Col>
                  </Row>
                </Container>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown drop="end">
        <Dropdown.Toggle variant="light" size="sm" id="dropdown-tool-label">
          <OverlayTrigger
            key="top"
            placement="top"
            overlay={
              <Tooltip className="tooltip" id="tooltip-drawing-tool-label">
                {t("drawLabels")}
              </Tooltip>
            }
          >
            <TfiText />
          </OverlayTrigger>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() =>
              addAnnotation({ annotationType: "label", name: "label" })
            }
          >
            <Container fluid>
              <Row>
                <Col md="1">
                  <TfiText />
                </Col>
                <Col>Text</Col>
              </Row>
            </Container>
          </Dropdown.Item>
          {markerType.map((tool, index) => {
            return (
              <Dropdown.Item key={index} onClick={() => addAnnotation(tool)}>
                <Row key={index}>
                  <Col md="1">
                    <span className={tool.icon}></span>
                  </Col>
                  <Col>{t(`markerType.${tool.name}`)}</Col>
                </Row>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
      <Button
        variant="light"
        size="sm"
        onClick={toggleRealTime}
        active={realTime}
        style={{ whiteSpace: "nowrap" }}
      >
        {t("toggleRealTime")}
      </Button>
      <Dropdown drop="up">
        <Dropdown.Toggle variant="light" id="dropdown-timezone" size="sm">
          <OverlayTrigger
            key="top"
            placement="top"
            overlay={
              <Tooltip className="tooltip" id="tooltip-timezone">
                {t("changeTimezone")}
              </Tooltip>
            }
          >
            <span>
              {"UTC(" + (timezone.value > 0 ? "+" : "") + timezone.value + ")"}
            </span>
          </OverlayTrigger>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            as="top"
            onClick={() => changeTimeZone({ name: "UTC", value: 0 })}
            active={timezone.value === 0}
          >
            UTC
          </Dropdown.Item>
          <Dropdown.Item
            as="top"
            onClick={() => changeTimeZone({ name: "Exchange", value: 0 })}
            active={timezone.name === "Exchange"}
          >
            Exchange
          </Dropdown.Item>
          {timezoneSelection.map((timezoneloop) => (
            <Dropdown.Item
              as="top"
              key={timezoneloop.name}
              onClick={() => changeTimeZone(timezone)}
              active={timezoneloop.value === timezone.value}
            >
              {"UTC(" +
                (timezoneloop.value > 0 ? "+" : "") +
                timezoneloop.value +
                ")" +
                timezoneloop.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      <div className="pe-1 ps-1">{t("from")}</div>
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
      <div className="pe-1 ps-1">{t("to")}</div>
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
        {t("longestTime")}
      </Button>
    </div>
  );
}

export default ChartToolBar;
