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

import { BiEditAlt } from "react-icons/bi";
import { MdHorizontalRule } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { SketchPicker } from "react-color";

import { drawingActions } from "../../store/drawing-slice";

import drawingTool from "./DRAWINGTOOL";
import strokeWidth from "./STROKEWIDTH";
import strokeType from "./STROKETYPE";

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
  const showDrawToolBar = useSelector((state) => state.drawing.showDrawToolBar);
  const colorStroke = useSelector((state) => state.drawing.colorStroke);
  const strokeTypeSelected = useSelector(
    (state) => state.drawing.strokeTypeSelected
  );
  const strokeWidthSelected = useSelector(
    (state) => state.drawing.strokeWidthSelected
  );

  const [pickedColorStroke, setPickedColorStroke] = useState(colorStroke);
  const [pickedColorFill, setPickedColorFill] = useState(colorStroke);

  const setAnnotationSetting = useCallback(
    (opt, type) => {
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
        default:
          break;
      }

      var strokeDash;
      switch (type === "strokeType" ? opt.value : strokeTypeSelected.value) {
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
        thickness:
          type === "strokeWidth" ? opt.value : strokeWidthSelected.value,
        color: type === "colorStroke" ? opt : colorStroke,
        dash: strokeDash,
      };

      switch (type) {
        case "colorStroke":
        case "strokeWidth":
        case "strokeType":
          selectedAnno.stroke(strokeSettings);
          break;
        case "colorFill":
          selectedAnno.fill(opt);
          break;
        default:
          break;
      }
    },
    [chart, colorStroke, dispatch, strokeTypeSelected, strokeWidthSelected]
  );

  const removeSelectedAnnotation = useCallback(() => {
    var annotation = chart.current.annotations().getSelectedAnnotation();
    if (annotation) chart.current.annotations().removeAnnotation(annotation);

    dispatch(drawingActions.toogleDrawToolBar(false));
    dispatch(drawingActions.setDrawingToolSelected({}));
  }, [chart, dispatch]);

  return (
    showDrawToolBar &&
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
                setAnnotationSetting(color.hex, "colorStroke");
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
                  setAnnotationSetting(color.hex, "colorFill");
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
                  onClick={() => setAnnotationSetting(opt, "strokeWidth")}
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
                  onClick={() => setAnnotationSetting(opt, "strokeType")}
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
    )
  );
}

export default DrawToolBar;
