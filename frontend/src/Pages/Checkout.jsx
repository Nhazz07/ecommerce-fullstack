import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContent";
import bleach from "../assets/figurebleach.jpg";
import { createOrder } from "../Services/orderApi";

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();

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

    const totalPrice = cartItems.reduce((total, item) => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);

        return total + price * quantity;
    }, 0);

    const shippingFee = 3;
    const finalTotal = totalPrice + shippingFee;

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
            couponId: null,
            shippingAddress,
            paymentMethod,
        };

        const response = await createOrder(orderData);

        console.log("Order created successfully:", response);

        alert("Your order has been placed successfully.");

        navigate("/orders");
    } catch (submitError) {
        console.error("Order creation failed:", submitError);

        const errorMessage =
            submitError.response?.data?.message ||
            submitError.message ||
            "Something went wrong while placing your order.";

        setError(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
};

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
                    {/* Shipping Information */}
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
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                                    placeholder="Enter your full name"
                                />
                            </div>

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
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                                    placeholder="Enter your phone number"
                                />
                            </div>

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
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                                    placeholder="Enter your shipping address"
                                />
                            </div>

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
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                                    placeholder="Enter your city"
                                />
                            </div>

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
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-400 dark:border-white/10 dark:bg-white/5"
                                    placeholder="Enter your country"
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
                    </section>

                    {/* Order Summary */}
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
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>
                                    ${totalPrice.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>
                                    ${shippingFee.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="my-5 border-t border-gray-200 dark:border-white/10" />

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
