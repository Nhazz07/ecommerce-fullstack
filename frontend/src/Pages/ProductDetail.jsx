import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../Services/productApi";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const [isLoading, setIsLoading] = useState(true);
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
                if (productData.productVariants?.length > 0) {
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

    const handleAddToCart = () => {
        if (!selectedVariant) {
            alert("Please select a variant.");
            return;
        }

        console.log("Add to cart:", {
            product,
            variant: selectedVariant,
            quantity,
        });

        // CartProvider connection will come here.
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-white px-4 pb-16 pt-24 dark:bg-[#0B1020]">
                <div className="mx-auto max-w-7xl py-20 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        Loading product...
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-white px-4 pb-16 pt-24 dark:bg-[#0B1020]">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
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

    const displayPrice = selectedVariant?.price
        ?? product.price
        ?? 0;

    return (
        <main className="min-h-screen bg-white px-4 pb-16 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
            <div className="mx-auto max-w-7xl">

                {/* Back Button */}
                <button
                    type="button"
                    onClick={() => navigate("/products")}
                    className="mb-8 text-sm font-medium text-gray-500 transition hover:text-pink-500 dark:text-gray-400"
                >
                    ← Back to Products
                </button>

                <div className="grid gap-10 lg:grid-cols-2">

                    {/* Product Image */}
                    <div>
                        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/10">
                            {image?.imageUrl ? (
                                <img
                                    src={image.imageUrl}
                                    alt={
                                        image.altText ||
                                        product.name
                                    }
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Information */}
                    <div className="flex flex-col justify-center">

                        {/* Category */}
                        <div className="mb-3 flex items-center gap-3">
                            <span className="text-sm font-semibold uppercase tracking-wide text-pink-500">
                                {product.categoryName || "Anime"}
                            </span>

                            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                                {product.status}
                            </span>
                        </div>

                        {/* Name */}
                        <h1 className="text-4xl font-bold tracking-tight">
                            {product.name}
                        </h1>

                        {/* Description */}
                        <p className="mt-5 leading-7 text-gray-600 dark:text-gray-400">
                            {product.description ||
                                "No description available."}
                        </p>

                        {/* Brand / Series */}
                        <div className="mt-6 space-y-2 text-sm">
                            {product.brandName && (
                                <p>
                                    <span className="font-semibold">
                                        Brand:
                                    </span>{" "}
                                    {product.brandName}
                                </p>
                            )}

                            {product.seriesName && (
                                <p>
                                    <span className="font-semibold">
                                        Series:
                                    </span>{" "}
                                    {product.seriesName}
                                </p>
                            )}

                            {product.sku && (
                                <p>
                                    <span className="font-semibold">
                                        SKU:
                                    </span>{" "}
                                    {product.sku}
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="mt-8">
                            <span className="text-3xl font-bold text-pink-500">
                                $
                                {Number(displayPrice).toFixed(2)}
                            </span>
                        </div>

                        {/* Variants */}
                        {product.productVariants?.length > 0 && (
                            <div className="mt-8">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="font-semibold">
                                        Variant
                                    </h2>

                                    {selectedVariant && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {selectedVariant.name}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {product.productVariants.map(
                                        (variant) => (
                                            <button
                                                key={variant.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedVariant(
                                                        variant
                                                    )
                                                }
                                                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                                                    selectedVariant?.id ===
                                                    variant.id
                                                        ? "border-pink-500 bg-pink-500 text-white"
                                                        : "border-gray-300 hover:border-pink-400 dark:border-white/20"
                                                }`}
                                            >
                                                {variant.name}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mt-8">
                            <h2 className="mb-3 font-semibold">
                                Quantity
                            </h2>

                            <div className="flex w-fit items-center overflow-hidden rounded-lg border border-gray-300 dark:border-white/20">
                                <button
                                    type="button"
                                    onClick={decreaseQuantity}
                                    className="px-4 py-2 text-lg transition hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                    −
                                </button>

                                <span className="min-w-12 px-4 text-center font-medium">
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={increaseQuantity}
                                    className="px-4 py-2 text-lg transition hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add To Cart */}
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={
                                product.productVariants?.length > 0 &&
                                !selectedVariant
                            }
                            className="mt-8 w-full rounded-xl bg-pink-500 py-4 text-lg font-bold text-[#0B1020] transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Add to Cart
                        </button>

                    </div>
                </div>
            </div>
        </main>
    );
}

export default ProductDetail;
