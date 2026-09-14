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

    console.log("Backend cart response:", response.data);

    return response.data;
};
