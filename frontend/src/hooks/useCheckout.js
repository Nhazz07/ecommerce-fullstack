import { useState } from "react";
import { createOrder } from "../Services/orderApi";

function useCheckout({
    coupon,
    clearCart,
    navigate,
    isAuthenticated,
    token,
}) {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        country: "",
    });

    const [paymentMethod, setPaymentMethod] = useState(
        "CASH_ON_DELIVERY"
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            if (!isAuthenticated) {
                navigate("/login", {
                    state: {
                        from: "/checkout",
                    },
                });
                return;
            }

            if (!token) {
                navigate("/login", {
                    state: {
                        from: "/checkout",
                    },
                });
                return;
            }

            const shippingAddress = [
                formData.fullName,
                formData.phone,
                formData.address,
                formData.city,
                formData.country,
            ]
                .filter(Boolean)
                .join(", ");

            const orderData = {
                couponId: coupon?.id || null,
                shippingAddress,
                paymentMethod,
            };

            console.log("Order data:", orderData);

            const response = await createOrder(
                orderData,
                token
            );

            console.log(
                "Order created successfully:",
                response
            );

            // Only clear cart after successful order
            clearCart();

            // Redirect to orders
            navigate("/orders");

        } catch (submitError) {
            console.error(
                "Order creation failed:",
                submitError.response?.data || submitError
            );

            const errorMessage =
                submitError.response?.data?.message ||
                submitError.message ||
                "Something went wrong while placing your order.";

            setError(errorMessage);

        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        paymentMethod,
        isSubmitting,
        error,
        setPaymentMethod,
        handleChange,
        handleSubmit,
    };
}

export default useCheckout;
