import axios from "axios";

const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/stockapi/"
    : "https://stockapp-backend-production.up.railway.app/stockapi/";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  },
});

api.interceptors.response.use(
  (response) =>
    "drawParameters" in response.data ? response.data : response.data.result,
  (error) => error.response.data
);

export default api;
