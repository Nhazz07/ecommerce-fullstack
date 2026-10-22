import client, { publicClient } from "./client";

const data = (response) => response.data.data;

export const catalogueApi = {
  products: (page = 0, size = 100) => publicClient.get("/api/product", { params: { page, size } }).then(data),
  allProducts: async (size = 100) => {
    const firstPage = await catalogueApi.products(0, size);
    const pageCount = Number(firstPage.totalPages) || 1;
    const remainingPages = await Promise.all(
      Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => catalogueApi.products(index + 1, size)),
    );
    return [firstPage, ...remainingPages].flatMap((page) => page.content || []);
  },
  product: (id) => publicClient.get(`/api/product/${id}`).then(data),
  productsForSeries: (seriesId) => publicClient.get(`/api/product/series/${seriesId}`).then(data),
  categories: () => publicClient.get("/api/category").then(data),
  brands: () => publicClient.get("/api/brand").then(data),
};

export const authApi = {
  login: (payload) => client.post("/api/auth/login", payload).then(data),
  register: (payload) => client.post("/api/auth/register", payload).then(data),
};

export const accountApi = {
  profile: () => client.get("/api/users/me").then(data),
  updateProfile: (payload) => client.put("/api/users/me", payload).then(data),
  addresses: () => client.get("/api/address").then(data),
  createAddress: (payload) => client.post("/api/address", payload).then(data),
  deleteAddress: (id) => client.delete(`/api/address/${id}`).then(data),
  setDefaultAddress: (addressId, userId) => client.put(`/api/address/${addressId}/default/${userId}`).then(data),
  orders: () => client.get("/api/order/my").then(data),
  order: (id) => client.get(`/api/order/${id}`).then(data),
  productReviews: (productId) => client.get(`/api/review/productId/${productId}`).then(data),
  createReview: (payload) => client.post("/api/review", payload).then(data),
  couponByCode: (code) => client.get(`/api/coupon/code/${encodeURIComponent(code)}`).then(data),
  productVariant: (id) => client.get(`/api/productVariant/${id}`).then(data),
  createOrder: (payload) => client.post("/api/order", payload).then(data),
  wishlists: () => client.get("/api/wishlist/my").then(data).catch((error) => {
    // The backend uses 404 (rather than an empty array) when the customer has no wishlist yet.
    if (error.response?.status === 404) return [];
    throw error;
  }),
  createWishlist: async (payload) => {
    const created = await client.post("/api/wishlist", payload).then(data);
    let wishlist = created;
    // WishlistMapper does not attach request productIds; use the supported product endpoint.
    for (const productId of payload.productIds || []) {
      wishlist = await client.post(`/api/wishlist/${created.id}/products/${productId}`).then((response) => response.data);
    }
    return wishlist;
  },
  addWishlistProduct: (wishlistId, productId) => client.post(`/api/wishlist/${wishlistId}/products/${productId}`).then((r) => r.data),
  removeWishlistProduct: (wishlistId, productId) => client.delete(`/api/wishlist/${wishlistId}/products/${productId}`).then((r) => r.data),
};

export const cartApi = {
  add: (item) => client.post("/api/cart", { productId: item.productId, productVariantId: item.variantId, quantity: item.quantity }).then(data),
};
