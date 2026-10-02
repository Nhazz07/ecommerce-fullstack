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

    const text = await response.text();

    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch (error) {
            console.error("Invalid JSON response:", text);
        }
    }

    console.log("Order API status:", response.status);
    console.log("Order API response:", data);

    if (!response.ok) {
        throw new Error(
            data?.message ||
            `Failed to create order. HTTP ${response.status}`
        );
    }

    return data;
};
