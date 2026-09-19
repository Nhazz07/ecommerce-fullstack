import { useMemo } from "react";

function useCartSummary(cartItems) {
    const totalItems = useMemo(() => {
        return cartItems.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );
    }, [cartItems]);

    const totalPrice = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const price = Number(item.price || 0);
            const quantity = Number(item.quantity || 0);

            return total + price * quantity;
        }, 0);
    }, [cartItems]);

    return {
        totalItems,
        totalPrice,
    };
}

export default useCartSummary;
