import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContent";
import { validateCoupon } from "../Services/couponApi";
import { createOrder } from "../Services/orderApi";

import CouponInput from "../Components/checkout/CouponInput";
import OrderSummary from "../Components/checkout/OrderSummary";
import PaymentMethod from "../Components/checkout/PaymentMethod";
import ShippingForm from "../Components/checkout/ShipingForm";

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();

    // Shipping information
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        country: "",
    });

    // Payment method
    const [paymentMethod, setPaymentMethod] = useState(
        "CASH_ON_DELIVERY"
    );

    // Order states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Coupon states
    const [couponCode, setCouponCode] = useState("");
    const [coupon, setCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    // Calculate subtotal
    const totalPrice = cartItems.reduce((total, item) => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);

        return total + price * quantity;
    }, 0);

    // Shipping fee
    const shippingFee = 3;

    // Calculate discount
    const discountAmount = (() => {
        if (!coupon) {
            return 0;
        }

        const discountType = coupon.discountType;
        const discountValue = Number(coupon.discountValue || 0);
        const minimumOrderAmount = Number(
            coupon.minimumOrderAmount || 0
        );

        // Check minimum order amount
        if (totalPrice < minimumOrderAmount) {
            return 0;
        }

        // Percentage discount
        if (discountType === "PERCENTAGE") {
            const discount = (totalPrice * discountValue) / 100;

            return Math.min(discount, totalPrice);
        }

        // Fixed amount discount
        if (discountType === "FIXED_AMOUNT") {
            return Math.min(discountValue, totalPrice);
        }

        return 0;
    })();

    // Calculate final total
    const finalTotal = Math.max(
        0,
        totalPrice - discountAmount + shippingFee
    );

    // Handle shipping input changes
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    // Apply coupon
    const handleApplyCoupon = async () => {
        const trimmedCode = couponCode.trim();

        if (!trimmedCode) {
            setCoupon(null);
            setCouponError("Please enter a promo code.");
            return;
        }

        setCouponError("");
        setCoupon(null);
        setIsApplyingCoupon(true);

        try {
            const response = await validateCoupon(trimmedCode);

            console.log("Coupon response:", response);

            const couponData = response?.data;

            if (!couponData) {
                throw new Error(
                    "Coupon data was not returned by the server."
                );
            }

            // Check whether coupon is active
            const active = couponData.active;

            if (active === false) {
                throw new Error("This coupon is inactive.");
            }

            // Check minimum order amount
            const minimumOrderAmount = Number(
                couponData.minimumOrderAmount || 0
            );

            if (totalPrice < minimumOrderAmount) {
                setCouponError(
                    `Your order must be at least $${minimumOrderAmount.toFixed(
                        2
                    )} to use this coupon.`
                );
                return;
            }

            // Apply coupon
            setCoupon(couponData);
            setCouponError("");
        } catch (couponValidationError) {
            console.error(
                "Coupon validation failed:",
                couponValidationError.response?.data ||
                    couponValidationError
            );

            setCoupon(null);

            setCouponError(
                couponValidationError.response?.data?.message ||
                    couponValidationError.message ||
                    "Invalid, expired, or unavailable promo code."
            );
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    // Remove coupon
    const handleRemoveCoupon = () => {
        setCoupon(null);
        setCouponCode("");
        setCouponError("");
    };

    // Submit order
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "You must be logged in before placing an order."
                );
            }

            // Combine shipping fields into one address string
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

            const response = await createOrder(orderData);

            console.log("Order created successfully:", response);

            // Clear cart after successful order
            clearCart();

            alert("Your order has been placed successfully.");

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

    // Empty cart
    if (cartItems.length === 0) {
        return (
            <main className="min-h-screen bg-white px-4 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
                <div className="mx-auto max-w-3xl py-24 text-center">
                    <h1 className="text-3xl font-bold">
                        Your Cart Is Empty
                    </h1>

                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                        Add products before proceeding to checkout.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/products")}
                        className="mt-6 rounded-lg bg-pink-400 px-6 py-3 font-semibold text-[#0B1020] transition hover:bg-pink-300"
                    >
                        Continue Shopping
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white px-4 pb-16 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-8 text-3xl font-bold">
                    Checkout
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="grid items-start gap-8 lg:grid-cols-3"
                >
                    {/* Left side */}
                    <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5 lg:col-span-2">
                        {/* Shipping Form */}
                        <ShippingForm
                            formData={formData}
                            handleChange={handleChange}
                            error={error}
                        />

                        {/* Payment Method */}
                        <div className="mt-8">
                            <PaymentMethod
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                            />
                        </div>

                        {/* Promo Code */}
                        <CouponInput
                            couponCode={couponCode}
                            setCouponCode={setCouponCode}
                            couponError={couponError}
                            setCouponError={setCouponError}
                            coupon={coupon}
                            isApplyingCoupon={isApplyingCoupon}
                            handleApplyCoupon={handleApplyCoupon}
                            handleRemoveCoupon={handleRemoveCoupon}
                        />
                    </section>

                    {/* Right side */}
                    <aside className="h-fit rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                        <OrderSummary
                            cartItems={cartItems}
                            totalPrice={totalPrice}
                            coupon={coupon}
                            discountAmount={discountAmount}
                            shippingFee={shippingFee}
                            finalTotal={finalTotal}
                            isSubmitting={isSubmitting}
                        />
                    </aside>
                </form>
            </div>
        </main>
    );
}

export default Checkout;
