

import api from "./api";

export const getVariantsByProductId = async (productId) => {
    const response = await api.get(
        `/api/productVariant/productId/${productId}`
    );

    console.log("Product variants response:", response.data);

    return response.data.data;
};
