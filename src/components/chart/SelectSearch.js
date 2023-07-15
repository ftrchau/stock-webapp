import { useState, useCallback } from "react";
import Select from "react-select";
import stockApi from "../../api/stock";
import { useDispatch, useSelector } from "react-redux";
import { stockActions } from "../../store/stock-slice";

function SelectSearch() {
  // const { ticker, label, setTicker } = props;
  const dispatch = useDispatch();
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

  const searchStock = useCallback(
    (value) => {
      const callAPI = async () => {
        const apiResult = await stockApi.getStockList({
          query: value,
        });

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

  return (
    <Select
      defaultValue={selectedTicker}
      onInputChange={(value) => searchStock(value)}
      onChange={(opt) => setSelectedTicker(opt)}
      options={searchedData}
      placeholder="Type to search, e.g. AAPL, 0700.HK"
      isSearchable
    />
  );
}

export default SelectSearch;
