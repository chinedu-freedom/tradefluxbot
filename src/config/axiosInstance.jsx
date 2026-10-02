"use client";

import axios from "axios";
import { CookieManager } from "@/utils/cookie-utils";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

// Attach token if available
if (typeof window !== "undefined") {
  const token = CookieManager.get("sec-prd-token");
  if (token) axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
}

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
  const expires = keepMeLoggedIn ? 1 : 1 / 24; // 24 hours (1 day) or 1 hour
  CookieManager.set("sec-prd-token", token, {
    expires,
    path: "/",
    secure: true,
    sameSite: "Strict",
  });
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  CookieManager.remove("sec-prd-token");
  delete axiosInstance.defaults.headers.common.Authorization;
};

export const getAuthToken = () => {
  return CookieManager.get("sec-prd-token");
};

export default axiosInstance;
