import "./App.css";
import AnyChart from "anychart-react";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { chartActions } from "./store/chart-slice";

function App() {
  const dispatch = useDispatch();
  const chart = useSelector((state) => state.chart.chart);

  useEffect(() => {
    dispatch(chartActions.initChart());
  });

  return (
    <AnyChart
      id="stock-chart"
      width="100%"
      height="100%"
      instance={chart}
      title="Simple pie chart"
    />
  );
}

export default App;
