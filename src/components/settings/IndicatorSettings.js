import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Container, Col, Row } from "react-bootstrap";
import IndicatorSetting from "./IndicatorSetting";

function IndicatorSettings({
  changeIndicatorSetting,
  removeIndicator,
  updateIndicator,
  hideIndicator,
  showIndicator,
}) {
  const currentIndicators = useSelector(
    (state) => state.indicator.currentIndicators
  );

  const { t } = useTranslation();

  return (
    <Container>
      {currentIndicators.length > 0 && (
        <span>{t("indicatorSetting.Indicator Settings")}</span>
      )}
      {currentIndicators.map((ind, index) => {
        return (
          <Row key={index}>
            <Col key={ind.name + index}>
              <IndicatorSetting
                key={ind.name}
                index={index}
                indicatorIndex={
                  currentIndicators.filter(
                    (indloop) => indloop.name === ind.name
                  ).length - 1
                }
                ind={ind}
                changeIndicatorSetting={changeIndicatorSetting}
                updateIndicator={updateIndicator}
                removeIndicator={removeIndicator}
                showIndicator={showIndicator}
                hideIndicator={hideIndicator}
              />
            </Col>
          </Row>
        );
      })}
    </Container>
  );
}

export default IndicatorSettings;
