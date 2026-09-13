// src/Services/cartApi.js

import api from "./api";

export const createCart = async (
    productId,
    productVariantId,
    quantity
) => {
    const response = await api.post("/api/cart", {
        productId,
        productVariantId,
        quantity,
    });

    console.log("Backend cart response:", response.data);

    return response;
};
