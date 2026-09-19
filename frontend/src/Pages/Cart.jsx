import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../Context/CartContent";

import CartList from "../Components/cart/CartList"
import CartSummary from "../Components/cart/CartSummary"
import EmptyCart from "../Components/cart/EmptyCart"
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
                onContinueShopping={
                    handleContinueShopping
                }
            />
        );
    }

    return (
        <main className="min-h-screen bg-white px-4 pb-16 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
            <div className="mx-auto max-w-7xl">

                <h1 className="mb-8 text-3xl font-bold">
                    Shopping Cart
                </h1>

                <div className="grid items-start gap-8 lg:grid-cols-3">

                    {/* Cart Items */}
                    <CartList
                        cartItems={cartItems}
                        updateQuantity={updateQuantity}
                        removeFromCart={removeFromCart}
                    />

                    {/* Summary */}
                    <CartSummary
                        totalItems={totalItems}
                        totalPrice={totalPrice}
                        onCheckout={handleCheckout}
                    />
                </div>

                {/* Continue Shopping */}
                <button
                    type="button"
                    onClick={handleContinueShopping}
                    className="mt-6 flex items-center gap-2 text-gray-500 transition hover:text-pink-500 dark:text-gray-400"
                >
                    <ArrowLeft size={18} />
                    Continue Shopping
                </button>
            </div>
        </main>
    );
}

export default Cart;
