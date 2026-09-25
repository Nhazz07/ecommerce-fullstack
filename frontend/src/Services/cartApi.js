import api from "./api";

export const createCart = async (
    productId,
    productVariantId,
    quantity,
    cartToken
) => {
    const response = await api.post(
        "/api/cart",
        {
            productId,
            productVariantId,
            quantity,
        },
        {
            headers: {
                "X-Cart-Token": cartToken || "",
            },
        }
    );

    console.log(
        "Backend created cart:",
        response.data
    );

    return response.data;
};

export const updateCart = async (
    cartId,
    productId,
    productVariantId,
    quantity,
    cartToken
) => {
    const response = await api.put(
        `/api/cart/${cartId}`,
        {
            productId,
            productVariantId,
            quantity,
        },
        {
            headers: {
                "X-Cart-Token": cartToken || "",
            },
        }
    );

    console.log(
        "Backend updated cart:",
        response.data
    );

    return response.data;
};

export const removeCartItem = async (
    cartId,
    productVariantId,
    cartToken
) => {
    const response = await api.delete(
        `/api/cart/${cartId}/products/${productVariantId}`,
        {
            headers: {
                "X-Cart-Token": cartToken || "",
            },
        }
    );

    console.log(
        "Backend removed cart item:",
        response.data
    );

    return response.data;
};
