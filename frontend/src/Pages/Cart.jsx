import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../Context/CartContent";

import CartList from "../Components/cart/CartList";
import CartSummary from "../Components/cart/CartSummary";
import EmptyCart from "../Components/cart/EmptyCart";
import useCartSummary from "../hooks/useCartSummary";

function Cart() {
    const navigate = useNavigate();

    const {
        cartItems,
        removeFromCart,
        updateQuantity,
    } = useCart();

    const {
        totalItems,
        totalPrice,
    } = useCartSummary(cartItems);

    const handleCheckout = () => {
        navigate("/checkout");
    };

    const handleContinueShopping = () => {
        navigate("/products");
    };

    if (cartItems.length === 0) {
        return (
            <EmptyCart
                onContinueShopping={handleContinueShopping}
            />
        );
    }

    return (
        <main className="min-h-screen bg-white px-4 pb-20 pt-28 text-[#0B1020] dark:bg-[#080C16] dark:text-white sm:px-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <ShoppingBag size={20} />
                        </div>

                        <span className="text-sm font-medium uppercase tracking-wider text-blue-500">
                            Your Cart
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Shopping Cart
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Review your items before completing your order.
                    </p>
                </div>

                {/* Cart Content */}
                <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">

                    {/* Cart Items */}
                    <section>
                        <CartList
                            cartItems={cartItems}
                            updateQuantity={updateQuantity}
                            removeFromCart={removeFromCart}
                        />
                    </section>

                    {/* Summary */}
                    <aside className="lg:sticky lg:top-28">
                        <CartSummary
                            totalItems={totalItems}
                            totalPrice={totalPrice}
                            onCheckout={handleCheckout}
                        />
                    </aside>
                </div>

                {/* Continue Shopping */}
                <button
                    type="button"
                    onClick={handleContinueShopping}
                    className="mt-8 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                >
                    <ArrowLeft size={17} />
                    Continue Shopping
                </button>
            </div>
        </main>
    );
}

export default Cart;
