import { useState } from "react";

import TheChart from "../components/chart/TheChart";

function DayTrade() {
  const [ticker, setTicker] = useState("NVDA");

  return (
    <>
      <h3>Day Trade</h3>
      <TheChart ticker={ticker} />
    </>
  );
}

export default DayTrade;
