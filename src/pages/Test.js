import React, { useRef, useState } from "react";
import anychart from "anychart";

const Test = () => {
  const chartContainer = useRef(null);
  const chart = useRef(null);
  const [labelText, setLabelText] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);

  React.useEffect(() => {
    chart.current = anychart.stock();
    chart.current.container(chartContainer.current);
    chart.current.draw();

    return () => {
      chart.current.dispose();
    };
  }, []);

  const handleAddLabel = () => {
    if (!isDrawing) {
      chart.current.annotations().startDrawing();

      chart.current.listen("annotationDrawingFinish", (event) => {
        const label = event.annotation;
        label.text(labelText);
        chart.current.annotations().add(label);
        setIsDrawing(false);
      });

      setIsDrawing(true);
    }
  };

  const handleAnnotationSelect = (event) => {
    const selectedAnnotation = event.annotation;
    selectedAnnotation.textEditor().startEdit(); // Start editing the label text
  };

  const handleInputChange = (e) => {
    setLabelText(e.target.value);
  };

  React.useEffect(() => {
    if (chart.current) {
      chart.current
        .annotations()
        .listen("annotationSelect", handleAnnotationSelect);
    }
  }, [chart.current]);

  return (
    <div>
      <div
        ref={chartContainer}
        style={{ width: "100%", height: "400px" }}
      ></div>
      <input type="text" value={labelText} onChange={handleInputChange} />
      <button onClick={handleAddLabel}>
        {isDrawing ? "Finish Label" : "Add Label"}
      </button>
    </div>
  );
};

export default Test;
