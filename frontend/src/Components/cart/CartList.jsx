import CartItem from "./CartItem";

function CartList({
    cartItems,
    updateQuantity,
    removeFromCart,
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5 lg:col-span-2">

            {/* Desktop Table Header */}
            <div className="hidden grid-cols-[minmax(160px,2fr)_110px_85px_105px_55px] gap-3 border-b border-gray-200 bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 md:grid">
                <span>Product</span>
                <span>Quantity</span>
                <span>Price</span>
                <span>Subtotal</span>
                <span>Action</span>
            </div>

            {/* Cart Items */}
            {cartItems.map((item) => (
                <CartItem
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                />
            ))}
        </div>
    );
}

export default CartList;
