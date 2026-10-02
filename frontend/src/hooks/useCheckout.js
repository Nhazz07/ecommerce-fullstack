import { useState } from "react";
import { createOrder } from "../Services/orderApi";

function useCheckout({ coupon, clearCart, navigate, user }) {
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
            // Guest user → Login
            if (!user) {
                navigate("/login", {
                    state: {
                        from: "/checkout",
                    },
                });

                return;
            }

            // Get authenticated user's token
            const token = localStorage.getItem("token");

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

            // Clear cart after successful order
            clearCart();

            // Go to orders page
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
