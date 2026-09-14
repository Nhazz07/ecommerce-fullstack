import React from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContent";
import bleach from "../assets/figurebleach.jpg";

function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const handleAddToCart = async () => {
        console.log("Product:", product);

        await addToCart(product);
    };

    return (
        <div
            onClick={() => navigate(`/products/${product.id}`)}
            className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-pink-400 dark:border-white/10 dark:bg-white/5"
        >
            {/* Product Image */}
            <div className="h-56 overflow-hidden bg-gray-100 dark:bg-white/5">
                <img
                    src={product.image || bleach}
                    alt={product.productName || product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
            </div>

            {/* Product Information */}
            <div className="p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product.category || "Anime Figure"}
                </p>

                <h3 className="mt-1 truncate font-semibold text-[#0B1020] dark:text-white">
                    {product.productName || product.name}
                </h3>

                <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-[#0B1020] dark:text-white">
                        ${Number(product.price).toFixed(2)}
                    </span>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart();
                        }}
                        className="rounded-lg bg-pink-400 p-2 text-[#0B1020] transition hover:bg-pink-300"
                        title="Add to cart"
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
