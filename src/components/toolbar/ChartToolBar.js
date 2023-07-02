import { useState, useCallback, forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { drawingActions } from "../../store/drawing-slice";

import { Container, Dropdown, Row, Col } from "react-bootstrap";

import { Icon } from "@iconify/react";
import { TfiText } from "react-icons/tfi";

import classes from "./ChartToolBar.module.css";

import drawingTool from "./DRAWINGTOOL";
import markerType from "./MARKERTYPE";

function ChartToolBar({ chart }) {
  const dispatch = useDispatch();
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

  const addAnnotation = useCallback(
    (annotation) => {
      if (
        drawingTool
          .map((tool) => tool.annotationType)
          .includes(annotation.annotationType)
      )
        dispatch(drawingActions.setDrawingToolSelected(annotation));

      if (annotation.annotationType === "marker")
        dispatch(drawingActions.setMarkerTypeSelected(annotation));
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

  return (
    <nav className={classes["navbar-menu"]} style={{ width: 60 }}>
      <Dropdown drop="end">
        <Dropdown.Toggle variant="light" size="sm" id="dropdown-line">
          <Icon icon="ph:line-segment-thin" />
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
                    <Col md="10">{tool.name}</Col>
                  </Row>
                </Container>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown drop="end">
        <Dropdown.Toggle variant="light" size="sm" id="dropdown-label">
          <TfiText />
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
                  <Col>{tool.name}</Col>
                </Row>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </nav>
  );
}

export default ChartToolBar;
