import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContent";
import bleach from "../assets/figurebleach.jpg";

function Cart() {
    const navigate = useNavigate();

    const {
        cartItems,
        removeFromCart,
        updateQuantity,
    } = useCart();

    const totalItems = cartItems.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    const totalPrice = cartItems.reduce((total, item) => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);

        return total + price * quantity;
    }, 0);

    if (cartItems.length === 0) {
        return (
            <main className="min-h-screen bg-white px-4 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
                <div className="mx-auto max-w-7xl py-24 text-center">
                    <h1 className="text-3xl font-bold">
                        Your Cart Is Empty
                    </h1>

                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                        Add some anime products to your cart.
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
                    Shopping Cart
                </h1>

                <div className="grid items-start gap-8 lg:grid-cols-3">
                    {/* Cart Items */}
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
                        {cartItems.map((item) => {
                            const price = Number(item.price || 0);
                            const quantity = Number(item.quantity || 0);
                            const subtotal = price * quantity;

                            const productName =
                                item.productName ||
                                item.name ||
                                "Anime Figure";

                            return (
                                <div
                                    key={item.id}
                                    className="relative grid gap-5 border-b border-gray-200 p-4 last:border-b-0 dark:border-white/10 sm:p-6 md:grid-cols-[minmax(160px,2fr)_110px_85px_105px_55px] md:items-center md:gap-3"
                                >
                                    {/* Product */}
                                    <div className="flex min-w-0 items-center gap-4 pr-10 md:pr-0">
                                        <img
                                            src={item.image || bleach}
                                            alt={productName}
                                            className="h-20 w-20 shrink-0 rounded-lg object-cover"
                                        />

                                        <div className="min-w-0">
                                            <h2 className="truncate font-semibold">
                                                {productName}
                                            </h2>

                                            <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                                                {item.variantName ||
                                                    item.variant?.name ||
                                                    "Anime Figure"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="flex items-center justify-between gap-2 md:block">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 md:hidden">
                                            Quantity:
                                        </span>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id,
                                                        Math.max(
                                                            1,
                                                            quantity - 1
                                                        )
                                                    )
                                                }
                                                className="rounded border border-gray-200 p-2 transition hover:border-pink-400 dark:border-white/10"
                                                title="Decrease quantity"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus size={14} />
                                            </button>

                                            <span className="min-w-5 text-center">
                                                {quantity}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id,
                                                        quantity + 1
                                                    )
                                                }
                                                className="rounded border border-gray-200 p-2 transition hover:border-pink-400 dark:border-white/10"
                                                title="Increase quantity"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex justify-between md:block">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 md:hidden">
                                            Price:
                                        </span>

                                        <span className="font-medium">
                                            ${price.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="flex justify-between md:block">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 md:hidden">
                                            Subtotal:
                                        </span>

                                        <span className="font-bold text-pink-500">
                                            ${subtotal.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Remove Button */}
                                    <div className="absolute right-4 top-4 md:static md:flex md:items-center md:justify-center">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeFromCart(item.id)
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-300 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-300"
                                            title="Remove item"
                                            aria-label={`Remove ${productName} from cart`}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
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
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>

                        <div className="mt-3 flex justify-between text-gray-500 dark:text-gray-400">
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>

                        <div className="my-5 border-t border-gray-200 dark:border-white/10" />

                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                console.log("Proceed to checkout")
                            }
                            className="mt-6 w-full rounded-lg bg-pink-400 py-3 font-semibold text-[#0B1020] transition hover:bg-pink-300"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>

                {/* Continue Shopping */}
                <button
                    type="button"
                    onClick={() => navigate("/products")}
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
