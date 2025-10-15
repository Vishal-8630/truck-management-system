import axios from "axios";

// For production: https://divyanshiroadlines.com/api
// For development: http://localhost:3000/api
const appEnv = import.meta.env.VITE_APP_ENV;

const api = axios.create({
  baseURL:
    appEnv === "development"
      ? import.meta.env.VITE_DEV_BASE_URL
      : import.meta.env.VITE_PROD_BASE_URL,
  withCredentials: true, // send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
