import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const unwrap = (response) => response.data.data;

export const adminClient = axios.create({ baseURL });
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("anteiku_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
adminClient.interceptors.response.use((response) => response, (error) => {
  if ([401, 403].includes(error.response?.status) && typeof window !== "undefined") {
    localStorage.removeItem("anteiku_admin_token");
    localStorage.removeItem("anteiku_admin_user");
    window.dispatchEvent(new Event("anteiku:admin-denied"));
  }
  return Promise.reject(error);
});

export const adminError = (error) => error.response?.data?.message || error.message || "Request failed. Please try again.";

export const adminApi = {
  login: (payload) => adminClient.post("/api/auth/login", payload).then(unwrap),
  users: () => adminClient.get("/api/users").then(unwrap),
  products: (page = 0, size = 100) => adminClient.get("/api/product", { params: { page, size } }).then(unwrap),
  product: (id) => adminClient.get(`/api/product/${id}`).then(unwrap),
  createProduct: (payload) => adminClient.post("/api/product", payload).then(unwrap),
  updateProduct: (id, payload) => adminClient.put(`/api/product/${id}`, payload).then(unwrap),
  deleteProduct: (id) => adminClient.delete(`/api/product/${id}`).then(unwrap),
  categories: () => adminClient.get("/api/category").then(unwrap),
  createCategory: (payload) => adminClient.post("/api/category", payload).then(unwrap),
  updateCategory: (id, payload) => adminClient.put(`/api/category/${id}`, payload).then(unwrap),
  deleteCategory: (id) => adminClient.delete(`/api/category/${id}`).then(unwrap),
  brands: () => adminClient.get("/api/brand").then(unwrap),
  createBrand: (payload) => adminClient.post("/api/brand", payload).then(unwrap),
  updateBrand: (id, payload) => adminClient.put(`/api/brand/${id}`, payload).then(unwrap),
  deleteBrand: (id) => adminClient.delete(`/api/brand/${id}`).then(unwrap),
  series: () => adminClient.get("/api/series").then(unwrap),
  orders: () => adminClient.get("/api/order").then(unwrap),
  updateOrderStatus: (id, status) => adminClient.put(`/api/order/${id}/status`, null, { params: { orderStatus: status } }).then(unwrap),
  inventory: () => adminClient.get("/api/inventory").then(unwrap),
  updateInventory: (id, payload) => adminClient.put(`/api/inventory/${id}`, payload).then(unwrap),
  coupons: () => adminClient.get("/api/coupon").then(unwrap),
  createCoupon: (payload) => adminClient.post("/api/coupon", payload).then(unwrap),
  updateCoupon: (id, payload) => adminClient.put(`/api/coupon/${id}`, payload).then(unwrap),
  deleteCoupon: (id) => adminClient.delete(`/api/coupon/${id}`).then(unwrap),
};
