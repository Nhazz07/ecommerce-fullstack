import api from "./api";

export const getMyWishlists = async () => {
    const response = await api.get("/api/wishlist/my");

    return response.data;
};

export const createWishlist = async (wishlistData) => {
    const response = await api.post(
        "/api/wishlist",
        wishlistData
    );

    return response.data;
};

export const addProductToWishlist = async (
    wishlistId,
    productId
) => {
    const response = await api.post(
        `/api/wishlist/${wishlistId}/products/${productId}`
    );

    return response.data;
};

export const removeProductFromWishlist = async (
    wishlistId,
    productId
) => {
    const response = await api.delete(
        `/api/wishlist/${wishlistId}/products/${productId}`
    );

    return response.data;
};
