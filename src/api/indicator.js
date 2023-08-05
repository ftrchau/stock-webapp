import api from "./index";

const methods = {
  calculateStockSMA(params) {
    return api.post("/calculateSMA", params);
  },
  calculateStockALMA(params) {
    return api.post("/calculateALMA", params);
  },
  calculateStockSuperTrend(params) {
    return api.post("/calculateSuperTrend", params);
  },
  calculateOBV(params) {
    return api.post("/calculateOBV", params);
  },
  calculateBB(params) {
    return api.post("/calculateBB", params);
  },
  calculateEY(params) {
    return api.post("/calculateEY", params);
  },
  calculatePB(params) {
    return api.post("/calculatePB", params);
  },
  calculateMADeviation(params) {
    return api.post("/calculateMADeviation", params);
  },
  calculateRSI(params) {
    return api.post("/calculateRSI", params);
  },
  calculateRSIModified(params) {
    return api.post("/calculateRSIModified", params);
  },
  calculateMACD(params) {
    return api.post("/calculateMACD", params);
  },
  calculateMACDModified(params) {
    return api.post("/calculateMACDModified", params);
  },
  calculateMACrossing(params) {
    return api.post("/calculateMACrossing", params);
  },
  calculateMidDrift(params) {
    return api.post("/calculateMidDrift", params);
  },
  calculateHeikinAshiModified(params) {
    return api.post("/calculateHeikinAshiModified", params);
  },
  calculateKalmanFilter(params) {
    return api.post("/calculateKalmanFilter", params);
  },
  calculateARIMA(params) {
    return api.post("/calculateARIMA", params);
  },
  calculateWkHiLoRange(params) {
    return api.post("/calculateWkHiLoRange", params);
  },
  calculatePivotHiLo(params) {
    return api.post("/calculatePivotHiLo", params);
  },
  calculateFibo(params) {
    return api.post("/calculateFibo", params);
  },
  calculateTurtleTrade(params) {
    return api.post("/calculateTurtleTrade", params);
  },
  calculateMRBottom(params) {
    return api.post("/calculateMRBottom", params);
  },
  calculateVIXTopBottom(params) {
    return api.post("/calculateVIXTopBottom", params);
  },
  calculateKO(params) {
    return api.post("/calculateKO", params);
  },
  calculateLinearRegression(params) {
    return api.post("/calculateLinearRegression", params);
  },
  calculateZigZag(params) {
    return api.post("/calculateZigZag", params);
  },
  calculateIntraFiboPivotHiLo(params) {
    return api.post("/calculateIntraFiboPivotHiLo", params);
  },
  calculateIntraATR(params) {
    return api.post("/calculateIntraATR", params);
  },
};

export default methods;
