import {
    ArrowLeft,
    Check,
    Heart,
    Minus,
    Plus,
    ShoppingCart,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useCart } from "../Context/CartContent";
import { getProductById } from "../Services/productApi";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] =
        useState(null);

    const [quantity, setQuantity] = useState(1);

    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                setError("");

                const response = await getProductById(id);
                const productData = response.data;

                setProduct(productData);

                // Select first variant by default
                if (
                    productData.productVariants?.length > 0
                ) {
                    setSelectedVariant(
                        productData.productVariants[0]
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to fetch product:",
                    error.response?.data || error
                );

                setError(
                    error.response?.data?.message ||
                        "Failed to load product."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const increaseQuantity = () => {
        setQuantity((current) => current + 1);
    };

    const decreaseQuantity = () => {
        setQuantity((current) =>
            Math.max(1, current - 1)
        );
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            alert("Please select a variant.");
            return;
        }

        try {
            setIsAdding(true);
            setIsAdded(false);

            await addToCart(
                product,
                selectedVariant,
                quantity
            );

            setIsAdded(true);

            setTimeout(() => {
                setIsAdded(false);
            }, 2000);
        } catch (error) {
            console.error(
                "Failed to add product to cart:",
                error
            );
        } finally {
            setIsAdding(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-white px-4 pb-16 pt-24 dark:bg-[#080C16]">
                <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 dark:border-white/10 dark:border-t-blue-500" />

                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Loading product...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-white px-4 pb-16 pt-24 dark:bg-[#080C16]">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                        {error}
                    </div>
                </div>
            </main>
        );
    }

    if (!product) {
        return null;
    }

    const image = product.productImages?.[0];

    const displayPrice =
        selectedVariant?.price ??
        product.price ??
        0;

    return (
        <main className="min-h-screen bg-white px-4 pb-20 pt-24 text-[#0B1020] dark:bg-[#080C16] dark:text-white sm:px-6">

            <div className="mx-auto max-w-7xl">

                {/* ================= BACK ================= */}

                <button
                    type="button"
                    onClick={() => navigate("/products")}
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-500 dark:text-gray-400"
                >
                    <ArrowLeft size={17} />

                    Back to Products
                </button>


                {/* ================= PRODUCT ================= */}

                <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">

                    {/* ================= IMAGE ================= */}

                    <div className="relative">

                        <div className="absolute -inset-4 rounded-3xl bg-blue-500/5 blur-3xl" />

                        <div className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/[0.03]">

                            {image?.imageUrl ? (
                                <img
                                    src={image.imageUrl}
                                    alt={
                                        image.altText ||
                                        product.name
                                    }
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}

                            {/* Gradient */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />


                            {/* Wishlist */}
                            <button
                                type="button"
                                onClick={() =>
                                    setIsFavorite(
                                        !isFavorite
                                    )
                                }
                                className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-md backdrop-blur transition hover:scale-105 hover:border-blue-500 dark:border-white/10 dark:bg-[#080C16]/90"
                                title="Wishlist"
                            >
                                <Heart
                                    size={20}
                                    className={
                                        isFavorite
                                            ? "fill-blue-500 text-blue-500"
                                            : "text-gray-600 dark:text-gray-300"
                                    }
                                />
                            </button>


                            {/* Category */}
                            <div className="absolute bottom-5 left-5">
                                <span className="rounded-full bg-[#080C16]/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                                    {product.categoryName ||
                                        "Anime"}
                                </span>
                            </div>

                        </div>
                    </div>


                    {/* ================= PRODUCT INFO ================= */}

                    <div className="flex flex-col">

                        {/* Category + Status */}
                        <div className="mb-4 flex flex-wrap items-center gap-3">

                            <span className="text-sm font-bold uppercase tracking-wider text-blue-500">
                                {product.categoryName ||
                                    "Anime"}
                            </span>

                            {product.status && (
                                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500">
                                    {product.status}
                                </span>
                            )}

                        </div>


                        {/* Product Name */}
                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                            {product.name}
                        </h1>


                        {/* Description */}
                        <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400">
                            {product.description ||
                                "No description available."}
                        </p>


                        {/* Product Information */}
                        {(product.brandName ||
                            product.seriesName ||
                            product.sku) && (
                            <div className="mt-7 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-3">

                                {product.brandName && (
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Brand
                                        </p>

                                        <p className="mt-1 font-semibold">
                                            {product.brandName}
                                        </p>
                                    </div>
                                )}

                                {product.seriesName && (
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Series
                                        </p>

                                        <p className="mt-1 font-semibold">
                                            {product.seriesName}
                                        </p>
                                    </div>
                                )}

                                {product.sku && (
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            SKU
                                        </p>

                                        <p className="mt-1 font-semibold">
                                            {product.sku}
                                        </p>
                                    </div>
                                )}

                            </div>
                        )}


                        {/* Price */}
                        <div className="mt-8 border-y border-gray-200 py-6 dark:border-white/10">

                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                Price
                            </p>

                            <div className="mt-1 flex items-end gap-3">

                                <span className="text-4xl font-black text-blue-500">
                                    $
                                    {Number(
                                        displayPrice
                                    ).toFixed(2)}
                                </span>

                                <span className="pb-1 text-sm text-gray-400">
                                    USD
                                </span>

                            </div>

                        </div>


                        {/* ================= VARIANTS ================= */}

                        {product.productVariants?.length >
                            0 && (
                            <div className="mt-7">

                                <div className="mb-3 flex items-center justify-between">

                                    <h2 className="font-bold">
                                        Select Variant
                                    </h2>

                                    {selectedVariant && (
                                        <span className="text-sm font-medium text-blue-500">
                                            {
                                                selectedVariant.name
                                            }
                                        </span>
                                    )}

                                </div>

                                <div className="flex flex-wrap gap-3">

                                    {product.productVariants.map(
                                        (variant) => {
                                            const isSelected =
                                                selectedVariant?.id ===
                                                variant.id;

                                            return (
                                                <button
                                                    key={
                                                        variant.id
                                                    }
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedVariant(
                                                            variant
                                                        );

                                                        setIsAdded(
                                                            false
                                                        );
                                                    }}
                                                    className={`rounded-lg border px-5 py-3 text-sm font-semibold transition ${
                                                        isSelected
                                                            ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                            : "border-gray-300 bg-white hover:border-blue-500 hover:text-blue-500 dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-blue-500"
                                                    }`}
                                                >
                                                    {
                                                        variant.name
                                                    }
                                                </button>
                                            );
                                        }
                                    )}

                                </div>

                            </div>
                        )}


                        {/* ================= QUANTITY ================= */}

                        <div className="mt-7">

                            <h2 className="mb-3 font-bold">
                                Quantity
                            </h2>

                            <div className="flex w-fit items-center overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-white/15 dark:bg-white/[0.03]">

                                <button
                                    type="button"
                                    onClick={
                                        decreaseQuantity
                                    }
                                    disabled={
                                        quantity <= 1
                                    }
                                    className="flex h-11 w-11 items-center justify-center transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
                                >
                                    <Minus size={17} />
                                </button>

                                <span className="flex h-11 min-w-14 items-center justify-center border-x border-gray-300 px-4 font-bold dark:border-white/15">
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        increaseQuantity
                                    }
                                    className="flex h-11 w-11 items-center justify-center transition hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                    <Plus size={17} />
                                </button>

                            </div>

                        </div>


                        {/* ================= ADD TO CART ================= */}

                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={
                                isAdding ||
                                (product.productVariants
                                    ?.length > 0 &&
                                    !selectedVariant)
                            }
                            className={`mt-8 flex w-full items-center justify-center gap-2 rounded-lg py-4 text-base font-bold transition ${
                                isAdded
                                    ? "bg-green-500 text-white"
                                    : "bg-blue-500 text-white hover:bg-blue-600"
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                        >

                            {isAdding ? (
                                <>
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                    Adding...
                                </>
                            ) : isAdded ? (
                                <>
                                    <Check size={20} />

                                    Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={20} />

                                    Add to Cart
                                </>
                            )}

                        </button>


                        {/* Reassurance */}
                        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-gray-200 pt-5 text-center dark:border-white/10">

                            <div>
                                <p className="text-xs font-semibold">
                                    Secure
                                </p>

                                <p className="mt-1 text-[11px] text-gray-400">
                                    Payment
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold">
                                    Fast
                                </p>

                                <p className="mt-1 text-[11px] text-gray-400">
                                    Delivery
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold">
                                    Quality
                                </p>

                                <p className="mt-1 text-[11px] text-gray-400">
                                    Guaranteed
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}

export default ProductDetail;
