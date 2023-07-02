import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Button,
  ButtonGroup,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

import { Icon } from "@iconify/react";

import { BiEditAlt, BiBold, BiItalic } from "react-icons/bi";
import { MdHorizontalRule } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { TfiText } from "react-icons/tfi";
import { SketchPicker } from "react-color";

import { drawingActions } from "../../store/drawing-slice";

import drawingTool from "./DRAWINGTOOL";
import strokeWidth from "./STROKEWIDTH";
import strokeType from "./STROKETYPE";

import markerSize from "./MARKERSIZE";
import fontSize from "./FONTSIZE";
import fonthAlignOptions from "./FONTHALIGN";
import fontvAlignOptions from "./FONTVALIGN";

const noFillList = [
  "line",
  "horizontal-line",
  "vertical-line",
  "infinite-line",
  "ray",
  "andrews-pitchfork",
  "fibonacci-fan",
  "fibonacci-arc",
  "fibonacci-retracement",
  "fibonacci-timezones",
];

function DrawToolBar({ chart }) {
  const dispatch = useDispatch();
  const drawingToolSelected = useSelector(
    (state) => state.drawing.drawingToolSelected
  );

  const markerTypeSelected = useSelector(
    (state) => state.drawing.markerTypeSelected
  );

  const showDrawToolBar = useSelector((state) => state.drawing.showDrawToolBar);
  const colorStroke = useSelector((state) => state.drawing.colorStroke);
  const markerColorStroke = useSelector(
    (state) => state.drawing.markerColorStroke
  );
  const markerSizeSelected = useSelector(
    (state) => state.drawing.markerSizeSelected
  );
  const markerColorFill = useSelector((state) => state.drawing.markerColorFill);
  const markerStrokeTypeSelected = useSelector(
    (state) => state.drawing.markerStrokeTypeSelected
  );
  const strokeTypeSelected = useSelector(
    (state) => state.drawing.strokeTypeSelected
  );
  const strokeWidthSelected = useSelector(
    (state) => state.drawing.strokeWidthSelected
  );

  const fontSizeSelected = useSelector(
    (state) => state.drawing.fontSizeSelected
  );
  const fontColor = useSelector((state) => state.drawing.fontColor);
  const fontWeight = useSelector((state) => state.drawing.fontWeight);
  const fontStyle = useSelector((state) => state.drawing.fontStyle);
  const fonthAlign = useSelector((state) => state.drawing.fonthAlign);
  const fontvAlign = useSelector((state) => state.drawing.fontvAlign);

  const [pickedColorStroke, setPickedColorStroke] = useState(colorStroke);
  const [pickedColorFill, setPickedColorFill] = useState(colorStroke);

  const [pickedMarkerColorStroke, setPickedMarkerColorStroke] =
    useState(markerColorStroke);
  const [pickedMarkerColorFill, setPickedMarkerColorFill] =
    useState(markerColorFill);
  const [pickedFontColor, setFontColor] = useState(fontColor);

  const setAnnotationSetting = useCallback(
    (opt, type, toolType) => {
      var selectedAnno = chart.current.annotations().getSelectedAnnotation();
      switch (type) {
        case "colorFill":
          setPickedColorFill(opt);
          break;
        case "colorStroke":
          setPickedColorStroke(opt);
          dispatch(drawingActions.setColorFill(opt));
          break;
        case "strokeWidth":
          dispatch(drawingActions.setStrokeWidthSelected(opt));
          break;
        case "strokeType":
          dispatch(drawingActions.setStrokeTypeSelected(opt));
          break;
        case "markerColorStroke":
          dispatch(drawingActions.setMarkerColorStroke(opt));
          break;
        case "markerColorFill":
          dispatch(drawingActions.setMarkerColorFill(opt));
          break;
        case "markerStrokeType":
          dispatch(drawingActions.setMarkerStrokeTypeSelected(opt));
          break;
        case "markerSize":
          dispatch(drawingActions.setMarkerSizeSelected(opt));
          break;
        default:
          break;
      }

      var strokeDash;
      var strokeType;
      if (toolType === "drawingTool") {
        strokeType =
          type === "strokeType" ? opt.value : strokeTypeSelected.value;
      } else if (toolType === "marker") {
        strokeType =
          type === "markerStrokeType"
            ? opt.value
            : markerStrokeTypeSelected.value;
      } else {
      }
      switch (strokeType) {
        case 6:
          strokeDash = null;
          break;
        case 7:
          strokeDash = "1 1";
          break;
        case 8:
          strokeDash = "10 5";
          break;
        default:
          strokeDash = "1 1";
          break;
      }

      var strokeSettings = {
        dash: strokeDash,
      };

      if (toolType === "drawingTool") {
        strokeSettings.color = type === "colorStroke" ? opt : colorStroke;
        strokeSettings.thickness =
          type === "strokeWidth" ? opt.value : strokeWidthSelected.value;
      } else if (toolType === "marker") {
        strokeSettings.color =
          type === "markerColorStroke" ? opt : markerColorStroke;
      } else {
      }

      switch (type) {
        case "colorStroke":
        case "strokeWidth":
        case "strokeType":
          selectedAnno.stroke(strokeSettings);
          break;
        case "colorFill":
          selectedAnno.fill(opt);
          break;
        case "markerColorStroke":
        case "markerStrokeType":
          selectedAnno.stroke(strokeSettings);
          break;
        case "markerColorFill":
          selectedAnno.fill(opt);
          break;
        case "markerSize":
          selectedAnno.size(opt);
          break;
        default:
          break;
      }
    },
    [
      chart,
      colorStroke,
      dispatch,
      strokeTypeSelected,
      strokeWidthSelected,
      markerColorStroke,
      markerStrokeTypeSelected,
    ]
  );

  const removeSelectedAnnotation = useCallback(() => {
    var annotation = chart.current.annotations().getSelectedAnnotation();
    if (annotation) chart.current.annotations().removeAnnotation(annotation);

    dispatch(drawingActions.toogleDrawToolBar(false));
    dispatch(drawingActions.setDrawingToolSelected({}));
  }, [chart, dispatch]);

  const setLabel = useCallback(
    (opt, type) => {
      var selectedAnno = chart.current.annotations().getSelectedAnnotation();

      switch (type) {
        case "fontSize":
          dispatch(drawingActions.setFontSizeSelected(opt));
          selectedAnno.fontSize(opt);
          break;
        case "fontColor":
          dispatch(drawingActions.setFontColor(opt));
          selectedAnno.fontColor(opt);
          break;
        case "fontWeight":
          dispatch(drawingActions.setFontWeight(opt));
          selectedAnno.fontWeight(opt);
          break;
        case "fontStyle":
          dispatch(drawingActions.setFontStyle(opt));
          selectedAnno.fontStyle(opt);
          break;
        case "fonthAlign":
          dispatch(drawingActions.setFonthAlign(opt));
          selectedAnno.hAlign(opt);
          break;
        case "fontvAlign":
          dispatch(drawingActions.setFontvAlign(opt));
          selectedAnno.vAlign(opt);
          break;
        default:
          break;
      }
    },
    [chart, dispatch]
  );

  return (
    <>
      {showDrawToolBar &&
        drawingToolSelected &&
        drawingTool
          .map((tool) => tool.annotationType)
          .includes(drawingToolSelected.annotationType) && (
          <ButtonGroup>
            <Dropdown drop="down">
              <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="stroke-color">
                      Line tool colors
                    </Tooltip>
                  }
                >
                  <span>
                    <BiEditAlt />
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <SketchPicker
                  onChange={(color) => {
                    setPickedColorStroke(color.hex);
                    setAnnotationSetting(
                      color.hex,
                      "colorStroke",
                      "drawingTool"
                    );
                  }}
                  color={pickedColorStroke}
                />
              </Dropdown.Menu>
            </Dropdown>
            {!noFillList.includes(drawingToolSelected.annotationType) && (
              <Dropdown drop="down">
                <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                  <OverlayTrigger
                    key="bottom"
                    placement="bottom"
                    overlay={
                      <Tooltip className="tooltip" id="fill-color">
                        Line Background
                      </Tooltip>
                    }
                  >
                    <span>
                      <Icon icon="mdi:format-color-fill" />
                    </span>
                  </OverlayTrigger>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <SketchPicker
                    onChange={(color) => {
                      setPickedColorFill(color.hex);
                      setAnnotationSetting(
                        color.hex,
                        "colorFill",
                        "drawingTool"
                      );
                    }}
                    color={pickedColorFill}
                  />
                </Dropdown.Menu>
              </Dropdown>
            )}
            <Dropdown drop="down">
              <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="line-width">
                      Line tool width
                    </Tooltip>
                  }
                >
                  <span>
                    <MdHorizontalRule /> {strokeWidthSelected.name}
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {strokeWidth.map((opt, index) => {
                  return (
                    <Dropdown.Item
                      as="button"
                      key={index}
                      onClick={() =>
                        setAnnotationSetting(opt, "strokeWidth", "drawingTool")
                      }
                    >
                      {opt.name}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown drop="down">
              <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="line-type">
                      Line type
                    </Tooltip>
                  }
                >
                  <span>
                    <MdHorizontalRule />
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {strokeType.map((opt, index) => {
                  return (
                    <Dropdown.Item
                      as="button"
                      key={index}
                      onClick={() =>
                        setAnnotationSetting(opt, "strokeType", "drawingTool")
                      }
                    >
                      {opt.name}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>

            <Button
              variant="light"
              size="sm"
              onClick={() => removeSelectedAnnotation()}
            >
              <OverlayTrigger
                key="bottom"
                placement="bottom"
                overlay={
                  <Tooltip className="tooltip" id="delete">
                    Remove
                  </Tooltip>
                }
              >
                <span>
                  <RiDeleteBinLine />
                </span>
              </OverlayTrigger>
            </Button>
          </ButtonGroup>
        )}
      {showDrawToolBar &&
        drawingToolSelected &&
        drawingToolSelected.annotationType === "label" && (
          <ButtonGroup>
            <Dropdown drop="down">
              <Dropdown.Toggle
                variant="light"
                size="sm"
                id="dropdown-label-color"
              >
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="label-background-color">
                      Font color
                    </Tooltip>
                  }
                >
                  <span
                    style={{
                      borderBottom: `5px solid ${pickedFontColor}`,
                    }}
                  >
                    <TfiText />
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <SketchPicker
                  onChange={(color) => {
                    setFontColor(color.hex);
                    setLabel(color.hex, "fontColor");
                  }}
                  color={pickedFontColor}
                />
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown drop="down">
              <Dropdown.Toggle
                variant="light"
                size="sm"
                id="dropdown-label-size"
              >
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="label-size">
                      Font Size
                    </Tooltip>
                  }
                >
                  <span>{fontSizeSelected}</span>
                </OverlayTrigger>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {fontSize.map((opt, index) => {
                  return (
                    <Dropdown.Item
                      as="button"
                      key={index}
                      onClick={() => setLabel(opt, "fontSize")}
                    >
                      {opt}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
            <Button
              style={{
                backgroundColor: fontWeight === "bold" ? "#9598a1" : "#f8f9fa",
              }}
              variant="light"
              size="sm"
              onClick={() =>
                setLabel(
                  fontWeight === "bold" ? "normal" : "bold",
                  "fontWeight"
                )
              }
            >
              <OverlayTrigger
                key="bottom"
                placement="bottom"
                overlay={
                  <Tooltip className="tooltip" id="bold">
                    Bold
                  </Tooltip>
                }
              >
                <span>
                  <BiBold />
                </span>
              </OverlayTrigger>
            </Button>
            <Button
              style={{
                backgroundColor: fontStyle === "italic" ? "#9598a1" : "#f8f9fa",
              }}
              variant="light"
              size="sm"
              onClick={() =>
                setLabel(
                  fontStyle === "italic" ? "normal" : "italic",
                  "fontStyle"
                )
              }
            >
              <OverlayTrigger
                key="bottom"
                placement="bottom"
                overlay={
                  <Tooltip className="tooltip" id="italic">
                    Italic
                  </Tooltip>
                }
              >
                <span>
                  <BiItalic />
                </span>
              </OverlayTrigger>
            </Button>
            {fonthAlignOptions.map((opt, index) => (
              <Button
                style={{
                  backgroundColor:
                    opt.fontStyle === fonthAlign ? "#9598a1" : "#f8f9fa",
                }}
                variant="light"
                size="sm"
                key={index}
                onClick={() => setLabel(opt.fontStyle, "fonthAlign")}
              >
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="left">
                      {opt.name}
                    </Tooltip>
                  }
                >
                  <span className={opt.icon}></span>
                </OverlayTrigger>
              </Button>
            ))}
            {fontvAlignOptions.map((opt, index) => (
              <Button
                style={{
                  backgroundColor:
                    opt.fontStyle === fontvAlign ? "#9598a1" : "#f8f9fa",
                }}
                variant="light"
                size="sm"
                key={index}
                onClick={() => setLabel(opt.fontStyle, "fontvAlign")}
              >
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="left">
                      {opt.name}
                    </Tooltip>
                  }
                >
                  <span className={opt.icon}></span>
                </OverlayTrigger>
              </Button>
            ))}

            <Button
              variant="light"
              size="sm"
              onClick={() => removeSelectedAnnotation()}
            >
              <OverlayTrigger
                key="bottom"
                placement="bottom"
                overlay={
                  <Tooltip className="tooltip" id="delete">
                    Remove
                  </Tooltip>
                }
              >
                <span>
                  <RiDeleteBinLine />
                </span>
              </OverlayTrigger>
            </Button>
          </ButtonGroup>
        )}
      {showDrawToolBar &&
        markerTypeSelected &&
        markerTypeSelected.annotationType === "marker" && (
          <ButtonGroup>
            <Dropdown drop="down">
              <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="marker-line-color">
                      Line tool colors
                    </Tooltip>
                  }
                >
                  <span>
                    <BiEditAlt />
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <SketchPicker
                  onChange={(color) => {
                    setPickedMarkerColorStroke(color.hex);
                    setAnnotationSetting(
                      color.hex,
                      "markerColorStroke",
                      "marker"
                    );
                  }}
                  color={pickedMarkerColorStroke}
                />
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown drop="down">
              <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="marker-background-color">
                      Marker background
                    </Tooltip>
                  }
                >
                  <span>
                    <Icon icon="mdi:format-color-fill" />
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <SketchPicker
                  onChange={(color) => {
                    setPickedMarkerColorFill(color.hex);
                    setAnnotationSetting(
                      color.hex,
                      "markerColorFill",
                      "marker"
                    );
                  }}
                  color={pickedMarkerColorFill}
                />
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown drop="down">
              <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="line-type">
                      Line type
                    </Tooltip>
                  }
                >
                  <span>
                    <MdHorizontalRule />
                  </span>
                </OverlayTrigger>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {strokeType.map((opt, index) => {
                  return (
                    <Dropdown.Item
                      as="button"
                      key={index}
                      onClick={() =>
                        setAnnotationSetting(opt, "markerStrokeType", "marker")
                      }
                    >
                      {opt.name}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown drop="down">
              <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip" id="line-type">
                      Marker Size
                    </Tooltip>
                  }
                >
                  <span>{markerSizeSelected}</span>
                </OverlayTrigger>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {markerSize.map((opt, index) => {
                  return (
                    <Dropdown.Item
                      as="button"
                      key={index}
                      onClick={() =>
                        setAnnotationSetting(opt, "markerSize", "marker")
                      }
                    >
                      {opt}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
            <Button
              variant="light"
              size="sm"
              onClick={() => removeSelectedAnnotation()}
            >
              <OverlayTrigger
                key="bottom"
                placement="bottom"
                overlay={
                  <Tooltip className="tooltip" id="delete">
                    Remove
                  </Tooltip>
                }
              >
                <span>
                  <RiDeleteBinLine />
                </span>
              </OverlayTrigger>
            </Button>
          </ButtonGroup>
        )}
    </>
  );
}

export default DrawToolBar;
