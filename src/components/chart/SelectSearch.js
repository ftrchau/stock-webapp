import { useState, useCallback } from "react";
import Select from "react-select";
import stockApi from "../../api/stock";

function SelectSearch(props) {
  const { ticker, label, setTicker } = props;

  const [searchedData, setSearchedData] = useState([
    {
      label,
      value: ticker,
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
      onInputChange={(value) => searchStock(value)}
      onChange={(opt) => setTicker(opt)}
      options={searchedData}
      placeholder="Type to search, e.g. AAPL, 0700.HK"
      isSearchable
    />
  );
}

export default SelectSearch;
