function CartSummary({
    totalItems,
    totalPrice,
    onCheckout,
}) {
    return (
        <div className="h-fit rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
            <h2 className="text-xl font-bold">
                Order Summary
            </h2>

            <div className="mt-6 flex justify-between text-gray-500 dark:text-gray-400">
                <span>Total Items</span>
                <span>{totalItems}</span>
            </div>

            <div className="mt-3 flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span>
                    ${totalPrice.toFixed(2)}
                </span>
            </div>

            <div className="mt-3 flex justify-between text-gray-500 dark:text-gray-400">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
            </div>

            <div className="my-5 border-t border-gray-200 dark:border-white/10" />

            <div className="flex justify-between text-lg font-bold">
                <span>Total</span>

                <span className="text-pink-500">
                    ${totalPrice.toFixed(2)}
                </span>
            </div>

            <button
                type="button"
                onClick={onCheckout}
                className="mt-6 w-full rounded-lg bg-pink-400 py-3 font-semibold text-[#0B1020] transition hover:bg-pink-300"
            >
                Proceed to Checkout
            </button>
        </div>
    );
}

export default CartSummary;
