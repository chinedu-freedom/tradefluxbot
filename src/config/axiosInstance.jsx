"use client";

import axios from "axios";
import { CookieManager } from "@/utils/cookie-utils";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://tradefluxbot-backend-5gbk.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

// Dynamic request interceptor to always attach current token
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = CookieManager.get("sec-prd-token");
      if (token) {
        config.headers.Authorization = "Bearer " + token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if ((error?.response?.status === 401 || error?.response?.status === 403) && typeof window !== "undefined") {
      CookieManager.remove("sec-prd-token");
      delete axiosInstance.defaults.headers.common.Authorization;

      // Don't redirect if we're already on the login page
      if (window.location.pathname !== "/" && window.location.pathname !== "/auth/login") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions
export const setAuthToken = (token, keepMeLoggedIn = false) => {
  const expires = keepMeLoggedIn ? 30 : 1; // 30 days or 1 day
  CookieManager.set("sec-prd-token", token, {
    expires,
    path: "/",
    sameSite: "Lax",
  });
  axiosInstance.defaults.headers.common.Authorization = "Bearer " + token;
};

export const clearAuthToken = () => {
  CookieManager.remove("sec-prd-token");
  delete axiosInstance.defaults.headers.common.Authorization;
};

export const getAuthToken = () => {
  return CookieManager.get("sec-prd-token");
};

export default axiosInstance;
