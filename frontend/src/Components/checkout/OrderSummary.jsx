import React from 'react'

import bleach from "../../assets/figurebleach.jpg";

function OrderSummary({
    cartItems,
    totalPrice,
    coupon,
    discountAmount,
    shippingFee,
    finalTotal,
    isSubmitting,
}) {
    return (
        <div>
            <h2 className="text-xl font-bold">
                Order Summary
            </h2>

            <div className="mt-6 space-y-5">
                {cartItems.map((item) => {
                    const price = Number(item.price || 0);
                    const quantity = Number(item.quantity || 0);

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
                                    {quantity} × ${price.toFixed(2)}
                                </p>
                            </div>

                            <span className="font-semibold">
                                ${(price * quantity).toFixed(2)}
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
                    <span>${totalPrice.toFixed(2)}</span>
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
                    <span>${shippingFee.toFixed(2)}</span>
                </div>
            </div>

            <div className="my-5 border-t border-gray-200 dark:border-white/10" />

            {/* Final Total */}
            <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
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
        </div>
    );
}

export default OrderSummary;
