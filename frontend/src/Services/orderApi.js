const API_BASE_URL = "http://localhost:8080";

export const createOrder = async (orderData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/order`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create order."
        );
    }

    return data;
};
