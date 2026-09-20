
import api from "./api";

export const getProducts = async (page = 0 , size = 12) => {
    const response = await api.get("/api/product", {
        params: {
            page,
            size,
        },
    });

    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/api/product/${id}`);

    return response.data;
};

export const getProductByCategory = async (categoryId) => {
    const response = await api.get(
        `/api/product/category/${categoryId}`
    );
    return response.data;
};

export const getProductByBrand = async (brandId) => {
    const response = await api.get(
        `/api/product/brand/${brandId}`
    );
    return response.data;
};

export const getProductBySerires = async (seriresId) => {
    const response = await api.get(
        `/api/product/serires/${seriresId}`
    );
    return response.data;
}
