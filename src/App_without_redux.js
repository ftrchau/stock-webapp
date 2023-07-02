import "./App.css";
import AnyChart from "anychart-react";
import anychart from "anychart";
import { useState, useEffect, useMemo } from "react";

function App() {
  const [chart, setChart] = useState(null);
  const msftData = useMemo(
    () => [
      ["2004-01-02", 27.58, 27.77, 27.33, 27.45, 44487700],
      ["2004-01-05", 27.73, 28.18, 27.72, 28.14, 67333696],
      ["2004-01-06", 28.19, 28.28, 28.07, 28.24, 46950800],
      ["2004-01-07", 28.17, 28.31, 28.01, 28.21, 54298200],
      ["2004-01-08", 28.39, 28.48, 28, 28.16, 58810800],
      ["2004-01-09", 28.03, 28.06, 27.59, 27.66, 67079900],
      ["2004-01-12", 27.67, 27.73, 27.35, 27.57, 55845200],
      ["2004-01-13", 27.55, 27.64, 27.26, 27.43, 51555900],
      ["2004-01-14", 27.52, 27.73, 27.47, 27.7, 43907000],
      ["2004-01-15", 27.55, 27.72, 27.42, 27.54, 58504100],
      ["2004-01-16", 27.71, 27.88, 27.53, 27.81, 63983400],
      ["2004-01-20", 27.98, 28.2, 27.93, 28.1, 63068500],
      ["2004-01-21", 28.13, 28.3, 27.85, 28.3, 53570600],
      ["2004-01-22", 28.36, 28.44, 27.94, 28.01, 78425200],
      ["2004-01-23", 28.28, 28.76, 28.22, 28.48, 127259104],
      ["2004-01-26", 28.49, 28.83, 28.32, 28.8, 58299600],
    ],
    []
  );
  const lineData = useMemo(
    () => [
      ["2004-01-02", 27.58],
      ["2004-01-05", 27.73],
      ["2004-01-06", 28.19],
      ["2004-01-07", 28.17],
      ["2004-01-08", 28.39],
      ["2004-01-09", 28.03],
      ["2004-01-12", 27.67],
      ["2004-01-13", 27.55],
      ["2004-01-14", 27.52],
      ["2004-01-15", 27.55],
      ["2004-01-16", 27.71],
      ["2004-01-20", 27.98],
      ["2004-01-21", 28.13],
      ["2004-01-22", 28.36],
      ["2004-01-23", 28.28],
      ["2004-01-26", 28.49],
    ],
    []
  );
  useEffect(() => {
    setChart(anychart.stock());
  }, []);

  useEffect(() => {
    var msftDataTable = anychart.data.table();
    msftDataTable.addData(msftData);
    if (chart) {
      chart.tooltip(false);
      chart.crosshair().displayMode("float");
      var firstPlot = chart.plot(0);
      firstPlot
        .candlestick(
          msftDataTable.mapAs({ open: 1, high: 2, low: 3, close: 4 })
        )
        .name("MSFT");

      var lineDataTable = anychart.data.table();
      lineDataTable.addData(msftData);

      firstPlot.line(lineDataTable.mapAs({ value: 1 }));
    }
  }, [chart, msftData, lineData]);

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
