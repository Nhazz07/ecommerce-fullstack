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


// Get orders belonging to the logged-in customer
export const getMyOrders = async (token) => {
    const response = await fetch(
        `${API_BASE_URL}/api/order/my`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const text = await response.text();

    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch (error) {
            console.error("Invalid JSON response:", text);
        }
    }

    console.log("My Orders API status:", response.status);
    console.log("My Orders API response:", data);

    if (!response.ok) {
        throw new Error(
            data?.message ||
            `Failed to fetch orders. HTTP ${response.status}`
        );
    }

    return data;
};
