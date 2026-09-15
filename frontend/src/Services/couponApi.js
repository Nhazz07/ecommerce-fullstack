import api from "./api";

export const validateCoupon = async (code) => {
    console.log("Calling coupon API with code:", code);

    const response = await api.get(
        `/api/coupon/code/${encodeURIComponent(code)}`
    );

    console.log("Coupon API response:", response.data);

    return response.data;
};
