import axios from "axios";

const isProduction = process.env.NODE_ENV === "production";


export const axiosInstance = axios.create({
    baseURL: isProduction ? "https://hydraone-admin-backend.onrender.com" : "http://localhost:8080",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("adminToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);