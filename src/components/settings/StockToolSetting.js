import { useState } from "react";
import {
  Button,
  ButtonGroup,
  Col,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { BsGear } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { BsQuestionCircle } from "react-icons/bs";

import { useDispatch } from "react-redux";
import { indicatorActions } from "../../store/indicator-slice";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function StockToolSetting(props) {
  const [show, setShow] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const dispatch = useDispatch();

  const formSubmittionHandler = (submitEvent) => {
    submitEvent.preventDefault();

    let StockToolParam = [];
    Array.from(submitEvent.target.elements).forEach((elem) => {
      if (elem.name !== "") {
        ////console.log(elem);
        StockToolParam.push({
          name: elem.name,
          value: elem.type === "checkbox" ? elem.checked : elem.value,
          type: elem.type,
        });
      }
    });

    ////console.log(StockToolParam);

    dispatch(
      indicatorActions.setStockToolParams({
        index: props.index,
        parameters: StockToolParam,
      })
    );

    let ind = { ...props.ind };
    ind.parameters = StockToolParam;
    // ind.parameters.forEach((param, index) => {
    //   ind.parameters[index] = StockToolParam;
    // });

    props.updateStockTool(ind, props.stockToolIndex);

    setShow(false);
  };

  const removeSelectedStockTool = () => {
    // props.removeStockTool(props.ind, props.index);
    props.removeStockTool(props.ind, props.stockToolIndex);
    dispatch(indicatorActions.removeSelectedStockTool(props.stockToolIndex));
  };

  return (
    <div>
      {props.ind.name}
      <ButtonGroup>
        {props.ind.hide ? (
          <Button
            variant="light"
            size="sm"
            onClick={() => props.showStockTool(props.index, props.ind)}
          >
            <AiOutlineEyeInvisible />
          </Button>
        ) : (
          <Button
            variant="light"
            size="sm"
            onClick={() => props.hideStockTool(props.index, props.ind)}
          >
            <AiOutlineEye />
          </Button>
        )}
        {props.ind.description && (
          <Button variant="light" size="sm">
            <BsQuestionCircle onClick={() => setShowInfo(true)} />
          </Button>
        )}
        {props.ind.description && (
          <Modal
            show={showInfo}
            onHide={() => setShowInfo(false)}
            dialogClassName="modal-90w"
            aria-labelledby="example-custom-modal-styling-title"
          >
            <Modal.Header closeButton>
              <Modal.Title id="example-custom-modal-styling-title">
                {props.ind.name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body
              dangerouslySetInnerHTML={{ __html: props.ind.description }}
            ></Modal.Body>
          </Modal>
        )}
        <OverlayTrigger
          key="bottom-setting"
          placement="bottom"
          overlay={
            <Tooltip className="tooltip-settings" id="tooltip-settings">
              Settings
            </Tooltip>
          }
        >
          <>
            <Button variant="light" size="sm" onClick={() => setShow(true)}>
              <BsGear />
            </Button>
            <Modal
              show={show}
              onHide={() => setShow(false)}
              dialogClassName="modal-90w"
              aria-labelledby="example-custom-modal-styling-title"
            >
              <Modal.Header closeButton>
                <Modal.Title id="example-custom-modal-styling-title">
                  {props.ind.name}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={formSubmittionHandler}>
                  {props.ind.parameters.map((param, index) => {
                    return (
                      <Form.Group
                        as={Row}
                        className="mb-3"
                        controlId={param.name}
                        key={index}
                      >
                        <Form.Label column sm="6">
                          {param.label}
                        </Form.Label>
                        <Col sm="6">
                          {param.type === "text" && (
                            <Form.Control
                              type="text"
                              placeholder={param.name}
                              defaultValue={param.value}
                              name={param.name}
                            />
                          )}
                          {param.type === "select-one" && (
                            <Form.Select
                              type="text"
                              placeholder={param.name}
                              defaultValue={param.value}
                              name={param.name}
                            >
                              {param.items.map((item) => {
                                return (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                );
                              })}
                            </Form.Select>
                          )}
                          {param.type === "checkbox" && (
                            <Form.Check
                              type="checkbox"
                              name={param.name}
                              defaultChecked={param.value}
                            />
                          )}
                        </Col>
                      </Form.Group>
                    );
                  })}
                  <Form.Group as={Row} className="mb-12" controlId="submit">
                    <Col sm="7">
                      <Button variant="danger" type="reset">
                        Reset
                      </Button>
                    </Col>
                    <Col sm="2">
                      <Button variant="primary" type="submit">
                        OK
                      </Button>
                    </Col>
                    <Col sm="2">
                      <Button variant="secondary">Cancel</Button>
                    </Col>
                  </Form.Group>
                </Form>
              </Modal.Body>
            </Modal>
          </>
        </OverlayTrigger>
        <OverlayTrigger
          key="bottom-remove"
          placement="bottom"
          overlay={
            <Tooltip className="tooltip-settings" id="tooltip-remove">
              Remove
            </Tooltip>
          }
        >
          <Button
            variant="light"
            size="sm"
            onClick={() => removeSelectedStockTool()}
          >
            <IoMdClose />
          </Button>
        </OverlayTrigger>
      </ButtonGroup>
    </div>
  );
}

export default StockToolSetting;
