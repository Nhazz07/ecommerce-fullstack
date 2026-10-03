// src/Services/cartApi.js

import api from "./api";

/*
 * CREATE CART
 */
export const createCart = async (
    productId,
    productVariantId,
    quantity,
    cartToken
) => {
    const config = {};

    /*
     * Guest users use X-Cart-Token.
     * Logged-in users may not have a cart token,
     * so don't send an empty header.
     */
    if (cartToken) {
        config.headers = {
            "X-Cart-Token": cartToken,
        };
    }

    const response = await api.post(
        "/api/cart",
        {
            productId,
            productVariantId,
            quantity,
        },
        config
    );

    console.log(
        "Backend created cart:",
        response.data
    );

    return response.data;
};


/*
 * UPDATE CART
 */
export const updateCart = async (
    cartId,
    productId,
    productVariantId,
    quantity,
    cartToken
) => {
    const config = {};

    /*
     * Only send cart token when it exists.
     */
    if (cartToken) {
        config.headers = {
            "X-Cart-Token": cartToken,
        };
    }

    const response = await api.put(
        `/api/cart/${cartId}`,
        {
            productId,
            productVariantId,
            quantity,
        },
        config
    );

    console.log(
        "Backend updated cart:",
        response.data
    );

    return response.data;
};


/*
 * REMOVE CART ITEM
 */
export const removeCartItem = async (
    cartId,
    productVariantId,
    cartToken
) => {
    const config = {};

    /*
     * Only send cart token when it exists.
     */
    if (cartToken) {
        config.headers = {
            "X-Cart-Token": cartToken,
        };
    }

    const response = await api.delete(
        `/api/cart/${cartId}/products/${productVariantId}`,
        config
    );

    console.log(
        "Backend removed cart item:",
        response.data
    );

    return response.data;
};
