import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContent";
import bleach from "../assets/figurebleach.jpg";
import { createOrder } from "../Services/orderApi";
import { validateCoupon } from "../Services/couponApi";

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

        if (totalPrice < minimumOrderAmount) {
            return 0;
        }

        if (discountType === "PERCENTAGE") {
            const discount = (totalPrice * discountValue) / 100;

            return Math.min(discount, totalPrice);
        }

        if (discountType === "FIXED_AMOUNT") {
            return Math.min(discountValue, totalPrice);
        }

        return 0;
    })();

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

            /*
             * Your backend returns:
             *
             * {
             *   success: true,
             *   message: "...",
             *   data: {
             *      id: 1,
             *      code: "1234",
             *      discountType: "PERCENTAGE",
             *      discountValue: 10,
             *      minimumOrderAmount: 30
             *   }
             * }
             */

            const couponData = response?.data;

            if (!couponData) {
                throw new Error("Coupon data was not returned by the server.");
            }

            const active = couponData.active;

            if (active === false) {
                throw new Error("This coupon is inactive.");
            }

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

            setCoupon(couponData);
            setCouponError("");
        } catch (error) {
            console.error(
                "Coupon validation failed:",
                error.response?.data || error
            );

            setCoupon(null);

            setCouponError(
                error.response?.data?.message ||
                error.message ||
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
                        <h2 className="text-xl font-bold">
                            Shipping Information
                        </h2>

                        {error && (
                            <div className="mt-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full name"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Phone Number
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your phone number"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                                />
                            </div>

                            {/* Address */}
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="address"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Address
                                </label>

                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    placeholder="Enter your shipping address"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label
                                    htmlFor="city"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    City
                                </label>

                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your city"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                                />
                            </div>

                            {/* Country */}
                            <div>
                                <label
                                    htmlFor="country"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Country
                                </label>

                                <input
                                    id="country"
                                    name="country"
                                    type="text"
                                    value={formData.country}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your country"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mt-8">
                            <h2 className="text-xl font-bold">
                                Payment Method
                            </h2>

                            <div className="mt-4 space-y-3">
                                {[
                                    {
                                        value: "CASH_ON_DELIVERY",
                                        label: "Cash on Delivery",
                                    },
                                    {
                                        value: "ABA",
                                        label: "ABA Pay",
                                    },
                                    {
                                        value: "ACLEDA",
                                        label: "ACLEDA",
                                    },
                                    {
                                        value: "CREDIT_CARD",
                                        label: "Visa / Mastercard Credit Card",
                                    },
                                    {
                                        value: "DEBIT_CARD",
                                        label: "Visa / Mastercard Debit Card",
                                    },
                                    {
                                        value: "PAYPAL",
                                        label: "PayPal",
                                    },
                                ].map((method) => (
                                    <label
                                        key={method.value}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                                            paymentMethod === method.value
                                                ? "border-pink-400 bg-pink-50 dark:bg-pink-500/10"
                                                : "border-gray-300 dark:border-white/10"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.value}
                                            checked={
                                                paymentMethod === method.value
                                            }
                                            onChange={(event) =>
                                                setPaymentMethod(
                                                    event.target.value
                                                )
                                            }
                                        />

                                        <span className="font-medium">
                                            {method.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Promo Code */}
                        <div className="mt-8">
                            <h2 className="text-xl font-bold">
                                Promo Code / Coupon
                            </h2>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(event) => {
                                        setCouponCode(event.target.value);
                                        setCouponError("");
                                    }}
                                    placeholder="Enter promo code"
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 uppercase outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                                />

                                <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    disabled={
                                        !couponCode.trim() ||
                                        isApplyingCoupon
                                    }
                                    className="rounded-lg bg-pink-400 px-5 py-3 font-semibold text-[#0B1020] transition hover:bg-pink-300 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isApplyingCoupon
                                        ? "Checking..."
                                        : "Apply"}
                                </button>
                            </div>

                            {couponError && (
                                <p className="mt-2 text-sm text-red-500">
                                    {couponError}
                                </p>
                            )}

                            {coupon && (
                                <div className="mt-3 flex items-center justify-between rounded-lg border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
                                    <span>
                                        Coupon{" "}
                                        <strong>{coupon.code}</strong>{" "}
                                        applied
                                    </span>

                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="font-semibold hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Right side */}
                    <aside className="h-fit rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                        <h2 className="text-xl font-bold">
                            Order Summary
                        </h2>

                        <div className="mt-6 space-y-5">
                            {cartItems.map((item) => {
                                const price = Number(item.price || 0);
                                const quantity = Number(
                                    item.quantity || 0
                                );

                                const productName =
                                    item.productName ||
                                    item.name ||
                                    "Anime Figure";

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3"
                                    >
                                        <img
                                            src={item.image || bleach}
                                            alt={productName}
                                            className="h-16 w-16 rounded-lg object-cover"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {productName}
                                            </p>

                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {quantity} × $
                                                {price.toFixed(2)}
                                            </p>
                                        </div>

                                        <span className="font-semibold">
                                            $
                                            {(price * quantity).toFixed(2)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="my-6 border-t border-gray-200 dark:border-white/10" />

                        <div className="space-y-3 text-gray-500 dark:text-gray-400">
                            {/* Subtotal */}
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>
                                    ${totalPrice.toFixed(2)}
                                </span>
                            </div>

                            {/* Discount */}
                            {coupon && discountAmount > 0 && (
                                <div className="flex justify-between text-green-500">
                                    <span>Discount</span>
                                    <span>
                                        -${discountAmount.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            {/* Shipping */}
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>
                                    ${shippingFee.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="my-5 border-t border-gray-200 dark:border-white/10" />

                        {/* Final Total */}
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>
                                ${finalTotal.toFixed(2)}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-6 w-full rounded-lg bg-pink-400 py-3 font-semibold text-[#0B1020] transition hover:bg-pink-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting
                                ? "Placing Order..."
                                : "Place Order"}
                        </button>
                    </aside>
                </form>
            </div>
        </main>
    );
}

export default Checkout;
