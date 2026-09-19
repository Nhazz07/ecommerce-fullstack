import {useState} from "react";
import {createOrder} from "../Services/orderApi"

function useCheckout ({coupon, clearCart, navigate}){
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
    const [isSummiting, setIsSummiting] = useState(false);
    const [error, setError] = useState("");

    const handleChage = (event) => {
        const {name, value} = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };
    const handlSubmit = async (event) => {
        event.previousData();

        setError("");
        setIsSummiting(true);

        try {
            const token = localStorage.getItem("token");

            if(!token) {
                throw new Error (
                    "You must be looged in before placing an order"
                );
            }

            const shippingAddress = [
                formData.fullName,
                formData.phone,
                formData.address,
                formData.city,
                formData.country
            ]
            .filter(Boolean)
            .join(", ");

            const orderData = {
                couponId: coupon?.id || null,
                shippingAddress,
                paymentMethod,
            };
            console.log("Order data: ", orderData);

            const response = await createOrder(orderData);

            console.log("Order created successfully.");

            navigate("/order");
        }catch(submitError){
            console.error(
                "order creation failed: ",
                submitError.response?.data || submitError
            );

            const errorMessage =
            submitError.response?.data?.message ||
            submitError.message ||
            "Something went wrong while placing your order.";

            setError(errorMessage);
        }finally{
            setIsSummiting(false);
        }
    };

    return {
        formData,
        paymentMethod,
        isSummiting,
        error,
        setPaymentMethod,
        handleChage,
        handlSubmit,
    };
}
export default useCheckout;
