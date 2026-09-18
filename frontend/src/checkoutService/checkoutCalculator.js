export function calculateSubtotal(cartItems) {
    return cartItems.reduce((total, item) => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);

        return total + price * quantity;
    }, 0);
}

export function calculateDiscount(totalPrice, coupon) {
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
}

export function calculateFinalTotal(
    totalPrice,
    discountAmount,
    shippingFee
) {
    return Math.max(
        0,
        totalPrice - discountAmount + shippingFee
    );
}
