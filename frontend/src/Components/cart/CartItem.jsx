import { Minus, Plus, Trash2 } from "lucide-react";
import bleach from "../../assets/figurebleach.jpg";

function CartItem({
    item,
    updateQuantity,
    removeFromCart,
}) {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 0);

    const subtotal = price * quantity;

    const productName =
        item.productName ||
        item.name ||
        "Anime Figure";

    const variantName =
        item.variantName ||
        item.variant?.name ||
        "Anime Figure";

    return (
        <div className="relative grid gap-5 border-b border-gray-200 p-4 last:border-b-0 dark:border-white/10 sm:p-6 md:grid-cols-[minmax(160px,2fr)_110px_85px_105px_55px] md:items-center md:gap-3">

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
                        {variantName}
                    </p>
                </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between gap-2 md:block">
                <span className="text-sm text-gray-500 dark:text-gray-400 md:hidden">
                    Quantity:
                </span>

                <div className="flex items-center gap-3">
                    {/* Decrease */}
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

                    {/* Quantity */}
                    <span className="min-w-5 text-center">
                        {quantity}
                    </span>

                    {/* Increase */}
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
}

export default CartItem;
