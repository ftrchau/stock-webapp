import api from "./index";

export async function getStockData({ queryKey }) {
  const [, params] = queryKey;
  try {
    return await api.post("/stockprice", params);
  } catch (e) {
    throw new Error(e);
  }
}

const methods = {
  async getStockPrice(params) {
    try {
      return api.post("/stockprice", params);
    } catch (e) {
      //console.log(e);
    }
  },
  async getStockList(params) {
    try {
      return api.post("/getStockList", params);
    } catch (e) {
      //console.log(e);
    }
  },
  async getStockPriceRealTime(params) {
    try {
      return api.post("/getStockRealTime", params);
    } catch (e) {
      //console.log(e);
    }
  },
};

export default methods;
