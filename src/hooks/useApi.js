"use client";

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchData,
  postData,
  updateData,
  patchData,
  deleteData,
} from "@/config/apiHelpers";
import { toast } from "sonner";

// Centralized sanitizer to prevent leaking confidential data (emails, tokens, etc.)
const maskConfidentialData = (str) => {
  if (typeof str !== "string") return str;
  // Replace email addresses with "your email"
  return str.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "your email");
};

// Centralized error formatter
const getErrorMessage = (error) => {
  const data = error?.response?.data;
  let msg = "Something went wrong. Please try again.";
  if (data?.errors && Array.isArray(data.errors)) msg = data.errors.join(", ");
  else if (data?.message) msg = data.message;
  else if (data?.error) msg = data.error;
  else if (error?.message) msg = error.message;
  return maskConfidentialData(msg);
};

// Helper function to properly handle query keys
const handleQueryKey = (queryKey) => {
  return Array.isArray(queryKey) ? queryKey : [queryKey];
};

// GET - Fetch data
export const useFetchData = (
  endpoint,
  queryKey,
  options = {}
) => {
  return useQuery({
    queryKey: handleQueryKey(queryKey || endpoint),

    queryFn: async ({ signal }) => {
      const res = await fetchData(endpoint, { signal });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to fetch data");
      }

      return res;
    },

    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    enabled: options.enabled ?? true,

    // Retry logic
    retry: (failureCount, error) => {
      if (error?.name === "CanceledError") return false;
      const status = error?.response?.status;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 3;
    },

    // Exponential backoff
    retryDelay: (attemptIndex) => {
      return Math.min(1000 * 2 ** attemptIndex, 5000);
    },

    onError: (error) => {
      if (error?.name === "CanceledError") return;
      toast.error(getErrorMessage(error));
    },
  });
};

// GET - Fetch external data
export const useFetchExternalData = (
  url,
  queryKey,
  options = {}
) => {
  return useQuery({
    queryKey: handleQueryKey(queryKey || url),

    queryFn: async ({ signal }) => {
      const { data } = await axios.get(url, { signal });
      return data;
    },

    refetchInterval: options.refetchInterval ?? 9000,
    staleTime: options.staleTime ?? 9000,
    refetchOnWindowFocus: false,
    enabled: options.enabled ?? true,

    retry: 2,
  });
};

/* ================= SUCCESS MESSAGE MAPPER ================= */
const getSuccessMessage = (method, endpoint, res) => {
  if (res?.message && !["Request successful", "Updated successfully", "Deleted successfully", "Success", "Request completed successfully"].includes(res.message)) {
    return maskConfidentialData(res.message);
  }
  
  const path = typeof endpoint === "function" ? endpoint("") : endpoint;
  
  if (method === "POST") {
    if (path.includes("/auth/login")) return "Logged in successfully!";
    if (path.includes("/auth/register")) return "Registration successful! Welcome.";
    if (path.includes("/auth/verify-otp")) return "OTP verified successfully!";
    if (path.includes("/auth/forgot-password")) return "OTP sent successfully to your email!";
    if (path.includes("/auth/reset-password")) return "Password reset successfully!";
    if (path.includes("/users/checkin")) return "Daily check-in claimed successfully!";
    if (path.includes("/users/withdraw")) return "Withdrawal request submitted successfully!";
    if (path.includes("/users/deposit")) return "Deposit request submitted successfully!";
    if (path.includes("/users/treasure/claim")) return "Treasure code claimed successfully!";
    if (path.includes("/users/tasks/claim")) return "Task reward claimed successfully!";
    if (path.includes("/users/spin")) return "Lucky Spin completed successfully!";
    if (path.includes("/users/me/send-verification")) return "Verification code sent to your email!";
    if (path.includes("/users/me/verify-email")) return "Email verified successfully!";
    if (path.includes("/auth/resend-verification")) return "Verification code resent successfully!";
    return "Request successful!";
  }
  
  if (method === "PUT" || method === "PATCH") {
    if (path.includes("/users/me/payment")) return "Payment settings updated successfully!";
    if (path.includes("/users/me/password")) return "Login password updated successfully!";
    return "Changes saved successfully!";
  }
  
  if (method === "DELETE") {
    return "Deleted successfully!";
  }
  
  return "Request successful!";
};

// POST - Create or login
export const usePost = (endpoint, queryKey, isFormData = false, options = {}) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: async (data) => {
      const shouldUseFormData =
        isFormData || (typeof FormData !== "undefined" && data instanceof FormData);

      const res = await postData(endpoint, data, shouldUseFormData);

      if (res?.success === false) {
        throw new Error(res.message || res.error || "Request failed");
      }

      return res;
    },

    onSuccess: (res, variables, context) => {
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey: handleQueryKey(queryKey),
        });
      }
      queryClient.invalidateQueries(); // Force refetch of all data globally to keep tables fresh

      if (showToast) {
        toast.success(getSuccessMessage("POST", endpoint, res));
      }

      if (options?.onSuccess) {
        options.onSuccess(res, variables, context);
      }
    },

    onError: (error, variables, context) => {
      if (showToast) toast.error(getErrorMessage(error));
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
  });
};

// PUT - Full update
export const usePut = (endpoint, queryKey, options = {}) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: async (data) => {
      const res = await updateData(endpoint, data);
      if (!res?.success) throw new Error(res.message || res.error || "Update failed");
      return res;
    },
    onSuccess: (res, variables, context) => {
      if (queryKey) {
        queryClient.invalidateQueries({ 
          queryKey: handleQueryKey(queryKey) 
        });
      }
      queryClient.invalidateQueries(); // Force refetch of all data globally to keep tables fresh

      if (showToast) {
        toast.success(getSuccessMessage("PUT", endpoint, res));
      }
      if (options?.onSuccess) {
        options.onSuccess(res, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (showToast) toast.error(getErrorMessage(error));
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
  });
};

// PATCH - Partial update
export const usePatch = (endpoint, queryKey, isFormData = false, options = {}) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: async (payload) => {
      try {
        let url;
        let dataToSend;

        if (payload?.id && payload?.data) {
          url = typeof endpoint === "function" ? endpoint(payload.id) : endpoint;
          dataToSend = payload.data;
        }
        else if (payload?.id) {
          url = typeof endpoint === "function" ? endpoint(payload.id) : endpoint;
          dataToSend = { ...payload };
          delete dataToSend.id;
        }
        else {
          url = endpoint;
          dataToSend = payload;
        }

        const res = await patchData(url, dataToSend, isFormData);

        if (res?.success === false) {
          throw new Error(res.message || res.error || "Patch failed");
        }

        return res;
      } catch (error) {
        throw error;
      }
    },

    onSuccess: (res, variables, context) => {
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey: handleQueryKey(queryKey),
        });
      }
      queryClient.invalidateQueries(); // Force refetch of all data globally to keep tables fresh

      if (showToast) {
        toast.success(getSuccessMessage("PATCH", endpoint, res));
      }
      if (options?.onSuccess) {
        options.onSuccess(res, variables, context);
      }
    },

    onError: (error, variables, context) => {
      if (showToast) toast.error(getErrorMessage(error));
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
  });
};

// DELETE - Remove data
export const useDelete = (endpoint, queryKey, options = {}) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: async (id) => {
      if (!id) {
        throw new Error("Missing ID");
      }

      const url = typeof endpoint === "function" ? endpoint(id) : endpoint;
      const res = await deleteData(url);

      if (!res?.success) {
        throw new Error(res.message || res.error || "Delete failed");
      }

      return res;
    },
    onSuccess: (res, variables, context) => {
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey: handleQueryKey(queryKey),
        });
      }
      queryClient.invalidateQueries(); // Force refetch of all data globally to keep tables fresh

      if (showToast) {
        toast.success(getSuccessMessage("DELETE", endpoint, res));
      }
      if (options?.onSuccess) {
        options.onSuccess(res, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (showToast) toast.error(getErrorMessage(error));
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
  });
};
