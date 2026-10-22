import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const client = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

let redirectingForExpiredSession = false;

// Public browsing calls deliberately do not carry a stored bearer token.
// This prevents a stale token from changing the behavior of guest endpoints.
export const publicClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("anteiku_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const authError = error.response?.headers?.["x-auth-error"];
    if (authError === "token_expired" && typeof window !== "undefined") {
      localStorage.removeItem("anteiku_token");
      localStorage.removeItem("anteiku_user");
      window.dispatchEvent(new Event("anteiku:session-expired"));

      if (!redirectingForExpiredSession && window.location.pathname !== "/login") {
        redirectingForExpiredSession = true;
        const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        const returnTo = window.location.pathname === "/register" ? "/account" : currentPath;
        const params = new URLSearchParams({ returnTo, reason: "session-expired" });
        window.location.replace(`/login?${params.toString()}`);
      }
    }
    return Promise.reject(error);
  },
);

export const messageFrom = (error) =>
  error.response?.data?.message || error.message || "Something went wrong. Please try again.";

export default client;
