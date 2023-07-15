import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Modal, Button } from "react-bootstrap";
import Select from "react-select";
import stockApi from "../api/stock";

import classes from "./HomePage.module.css";
import { useDispatch, useSelector } from "react-redux";
import { indicatorActions } from "../store/indicator-slice";
import { stockActions } from "../store/stock-slice";

function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navigateHandler = (path) => {
    if (selectedTicker.value === "") {
      handleAlertOpen();
      return;
    }
    // navigate(path, {
    //   state: {
    //     ticker: selectedTicker.value,
    //     label: selectedTicker.label,
    //   },
    // });
    navigate(path);
  };
  const selectedTicker = useSelector((state) => state.stock.ticker);
  const setSelectedTicker = useCallback(
    (inputTicker) => {
      dispatch(stockActions.setTicker(inputTicker));
    },
    [dispatch]
  );
  const [searchedData, setSearchedData] = useState([
    {
      label: selectedTicker.label,
      value: selectedTicker.value,
    },
  ]);
  // const [selectedTicker, setSelectedTicker] = useState({
  //   value: "",
  //   label: "",
  // });
  const [alertShow, setAlertShow] = useState(false);
  const handleAlertOpen = () => setAlertShow(true);
  const handleAlertClose = () => setAlertShow(false);

  const searchStock = useCallback(
    (value) => {
      if (value.trim() === "") return;
      const callAPI = async () => {
        const apiResult = await stockApi.getStockList({
          query: value,
        });

        ////console.log(apiResult);
        const searchedResult = apiResult.map((re) => {
          return {
            value: re.symbol,
            label: re.symbol + " - " + re.shortname,
          };
        });
        setSearchedData(searchedResult);
      };

      callAPI();
    },
    [setSearchedData]
  );

  useEffect(() => {
    dispatch(indicatorActions.resetCurrentIndicatorStockTools());
  }, [dispatch]);

  return (
    <section className={classes.section}>
      <h3 className="ma-5">Search symbol</h3>
      <Select
        defaultValue={selectedTicker}
        onInputChange={(value) => searchStock(value)}
        onChange={(opt) => setSelectedTicker(opt)}
        options={searchedData}
        placeholder="Type to search, e.g. AAPL, 0700.HK"
        isSearchable
      />
      <Modal show={alertShow} onHide={handleAlertClose}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please type to search for symbol, e.g. AAPL, 0700.HK
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAlertClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <h2 className={classes.h2}>Select a Trading Timeframe</h2>
      <ul className={classes.ul}>
        <li className={classes.li}>
          <h3>Day Trade</h3>
          <button
            className={classes.button}
            onClick={() => navigateHandler("/stock-webapp/day-trade")}
          >
            Show Chart
          </button>
        </li>
        <li className={classes.li}>
          <h3>Mid to Long Term Trade</h3>
          <button
            className={classes.button}
            onClick={() => navigateHandler("/stock-webapp/long-term-trade")}
          >
            Show Chart
          </button>
        </li>
      </ul>
    </section>
  );
}

export default HomePage;
