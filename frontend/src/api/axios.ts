import axios from "axios";

// For production: https://divyanshiroadlines-backend.onrender.com/api
// For development: http://localhost:3000/api
const api = axios.create({
    baseURL: "https://divyanshiroadlines-backend.onrender.com/api",
    withCredentials: true, // send cookies with requests
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;