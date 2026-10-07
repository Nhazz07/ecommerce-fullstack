import {
    Heart,
    ShoppingCart,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContent";
import bleach from "../assets/figurebleach.jpg";

function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const handleAddToCart = async () => {
        await addToCart(product);
    };

    const productName =
        product.productName || product.name || "Unnamed Product";

    const productCategory =
        product.category || "Anime Figure";

    const productPrice =
        Number(product.price || 0);

    const productImage =
        product.image || bleach;

    return (
        <article
            onClick={() =>
                navigate(`/products/${product.id}`)
            }
            className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/50"
        >

            {/* Product Image */}
            <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-white/5">

                <img
                    src={productImage}
                    alt={productName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                {/* Wishlist */}
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-blue-500 dark:bg-[#080C16]/90 dark:text-gray-200 dark:hover:bg-[#080C16] dark:hover:text-blue-500"
                    title="Add to wishlist"
                >
                    <Heart
                        size={17}
                        strokeWidth={2}
                    />
                </button>

                {/* Image Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>


            {/* Product Information */}
            <div className="p-4">

                {/* Category */}
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {productCategory}
                </p>

                {/* Product Name */}
                <h3 className="mt-1 truncate text-sm font-semibold text-[#0B1020] dark:text-white">
                    {productName}
                </h3>


                {/* Price + Cart */}
                <div className="mt-4 flex items-center justify-between">

                    <span className="text-base font-bold text-[#0B1020] dark:text-white">
                        ${productPrice.toFixed(2)}
                    </span>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleAddToCart();
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white transition hover:bg-blue-600 active:scale-95"
                        title="Add to cart"
                    >
                        <ShoppingCart
                            size={17}
                            strokeWidth={2}
                        />
                    </button>

                </div>

            </div>
        </article>
    );
}

export default ProductCard;
