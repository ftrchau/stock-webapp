import { useSelector } from "react-redux";
import { Container, Col, Row } from "react-bootstrap";
import StockToolSetting from "./StockToolSetting";

function StockToolSettings({
  changeStockToolSetting,
  removeStockTool,
  updateStockTool,
}) {
  const currentStockTools = useSelector(
    (state) => state.indicator.currentStockTools
  );

  return (
    <Container>
      {currentStockTools.length > 0 && <span>Stock Tool Settings</span>}
      {currentStockTools.map((ind, index) => {
        return (
          <Row key={index}>
            <Col key={ind.name + index}>
              <StockToolSetting
                key={ind.name}
                index={index}
                stockToolIndex={index}
                ind={ind}
                changeStockToolSetting={changeStockToolSetting}
                updateStockTool={updateStockTool}
                removeStockTool={removeStockTool}
              />
            </Col>
          </Row>
        );
      })}
    </Container>
  );
}

export default StockToolSettings;
