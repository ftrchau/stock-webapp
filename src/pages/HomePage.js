import { useNavigate } from "react-router-dom";

import classes from "./HomePage.module.css";

function HomePage() {
  const navigate = useNavigate();
  const navigateHandler = (path) => navigate(path);

  return (
    <section className={classes.section}>
      <h2 className={classes.h2}>Select a Trading Timeframe</h2>
      <ul className={classes.ul}>
        <li className={classes.li}>
          <h3>Day Trading</h3>
          <button
            className={classes.button}
            onClick={() => navigateHandler("/day-trade")}
          >
            Show Chart
          </button>
        </li>
        <li className={classes.li}>
          <h3>Mid to Long Term Trading</h3>
          <button
            className={classes.button}
            onClick={() => navigateHandler("/long-term-trade")}
          >
            Show Chart
          </button>
        </li>
      </ul>
    </section>
  );
}

export default HomePage;
